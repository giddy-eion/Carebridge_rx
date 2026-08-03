// lib/utils/risk-engine.ts
//
// Pure, deterministic, framework-free functions that turn a patient's
// raw DoseEvent/Medication data into everything the UI displays.
// stores/patients-store.ts calls these and holds the results —
// nothing here touches React or Zustand.
//
// Two categories of function live here, and they work differently
// on purpose:
//
// 1. STRUCTURAL derivations (computeTodayDoseWindows,
//    computeAdherenceHistory, computeMissedDoseCount) are a straight
//    read of the DoseEvent[] array — "what actually happened."
//
// 2. The HEADLINE SCORE (adherencePercent, riskPercent) is NOT a
//    naive taken/total ratio. A literal ratio can't honestly move
//    from 42% to 68% off a single dose without either an unrealistic
//    pile of missed doses elsewhere or 30 days of fabricated history.
//    Instead it's an exponential moving average, recency-weighted —
//    this week's behavior moves the score more than distant history.
//    That's a legitimate product decision, not a shortcut: real
//    adherence products do this because recent behavior predicts
//    near-term readmission risk better than a flat 30-day average.
//    See recencyWeight below — it's the one constant worth discussing
//    with a real clinical advisor before this becomes more than a demo.

import type { DoseEvent, Medication } from "@/types/domain";
import type {
  TodayDoseWindow,
  DoseWindowStatus,
  AdherenceDay,
  AdherenceHistoryEntry,
} from "@/types/patient-view";
import type { TriageRiskStatus, TriageMetrics } from "@/types/clinician-view";

const HISTORY_WINDOW_DAYS = 7;

// ─────────────────────────────────────────────────────────────────
// Today's dose windows — drives the PIU Timer and DoseStatusCard
// ─────────────────────────────────────────────────────────────────

export function computeTodayDoseWindows(
  medications: Medication[],
  doseEvents: DoseEvent[],
  now: Date = new Date()
): TodayDoseWindow[] {
  const todayStr = now.toISOString().slice(0, 10);
  const windows: TodayDoseWindow[] = [];

  for (const med of medications) {
    for (const time of med.scheduleTimes) {
      const [hour, minute] = time.split(":").map(Number);
      const scheduled = new Date(`${todayStr}T00:00:00`);
      scheduled.setHours(hour, minute, 0, 0);

      const match = doseEvents.find(
        (e) =>
          e.medicationId === med.id &&
          e.scheduledTime.slice(0, 10) === todayStr &&
          e.scheduledTime.slice(11, 16) === time
      );

      let status: DoseWindowStatus;
      if (match?.takenAt) {
        status = "taken";
      } else if (now < scheduled) {
        status = "upcoming";
      } else if (now.getTime() - scheduled.getTime() <= 60 * 60 * 1000) {
        status = "due"; // within an hour of the scheduled time
      } else {
        status = "missed";
      }

      windows.push({
        medicationId: med.id,
        medicationName: med.name,
        discreetLabel: med.discreetLabel,
        scheduledTime: time,
        status,
        doseEventId: match?.id,
      });
    }
  }
  return windows;
}

// ─────────────────────────────────────────────────────────────────
// Last 7 days, per medication — drives the pill-icon adherence row
// ─────────────────────────────────────────────────────────────────

export function computeAdherenceHistory(
  medications: Medication[],
  doseEvents: DoseEvent[],
  now: Date = new Date()
): AdherenceHistoryEntry[] {
  return medications.map((med) => {
    const last7Days: AdherenceDay[] = [];
    for (let day = HISTORY_WINDOW_DAYS - 1; day >= 0; day--) {
      const d = new Date(now);
      d.setDate(d.getDate() - day);
      const dateStr = d.toISOString().slice(0, 10);

      const dayEvents = doseEvents.filter(
        (e) => e.medicationId === med.id && e.scheduledTime.slice(0, 10) === dateStr
      );
      const taken = dayEvents.length > 0 && dayEvents.every((e) => !!e.takenAt);

      last7Days.push({ date: dateStr, taken });
    }
    return { medicationId: med.id, medicationName: med.name, last7Days };
  });
}

// ─────────────────────────────────────────────────────────────────
// Missed dose count — a real, literal tally for display (the
// Triage Dashboard's "Missed Doses" column). Independent of the
// headline adherence score below; this doesn't get smoothed.
// ─────────────────────────────────────────────────────────────────

export function computeMissedDoseCount(doseEvents: DoseEvent[], now: Date = new Date()): number {
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - HISTORY_WINDOW_DAYS);

  return doseEvents.filter((e) => {
    const scheduled = new Date(e.scheduledTime);
    return scheduled >= windowStart && scheduled <= now && !e.takenAt;
  }).length;
}

// ─────────────────────────────────────────────────────────────────
// Headline adherence score — recency-weighted EMA, not a raw ratio
// ─────────────────────────────────────────────────────────────────

export type DoseOutcome = "taken" | "missed";

/**
 * Nudges a patient's adherence score toward 100 (taken) or 0 (missed)
 * based on a single new dose outcome. recencyWeight controls how much
 * one event can move the needle — 0.45 means roughly half the gap to
 * the outcome closes in a single action, which is what makes a demo
 * click feel consequential. Tune lower (e.g. 0.15–0.2) for a model
 * that reads as more conservative/clinical.
 */
export function applyDoseOutcomeToAdherence(
  currentAdherencePercent: number,
  outcome: DoseOutcome,
  recencyWeight = 0.45
): number {
  const target = outcome === "taken" ? 100 : 0;
  const next = currentAdherencePercent + recencyWeight * (target - currentAdherencePercent);
  return Math.max(0, Math.min(100, Math.round(next)));
}

/**
 * Converts adherence into a risk score. Deliberately a single-variable
 * function (not also weighted by missedDoseCount) so it stays legible
 * and reproducible — the same adherence number always yields the same
 * risk number. BASELINE and WEIGHT are calibrated so 42% adherence
 * (John's seeded starting point) yields ~82% risk, matching the seed
 * data in lib/mock/fixtures.ts exactly.
 */
export function computeRiskPercent(adherencePercent: number): number {
  const BASELINE = 5;
  const WEIGHT = 1.33;
  const raw = BASELINE + (100 - adherencePercent) * WEIGHT;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function riskTagline(adherencePercent: number, missedDoseCount: number): string {
  if (missedDoseCount >= 3) return "Frequent evening dose omissions detected.";
  if (missedDoseCount >= 1) return "Occasional missed doses detected this week.";
  if (adherencePercent >= 90) return "Consistently adherent, no recent concerns.";
  return "Generally stable with minor adherence gaps.";
}

// ─────────────────────────────────────────────────────────────────
// One-shot recompute — called by the store after any dose action
// ─────────────────────────────────────────────────────────────────

export interface RecomputedPatientMetrics {
  adherencePercent: number;
  riskPercent: number;
  riskTagline: string;
}

export function recomputeAfterDoseOutcome(
  currentAdherencePercent: number,
  outcome: DoseOutcome,
  missedDoseCount: number
): RecomputedPatientMetrics {
  const adherencePercent = applyDoseOutcomeToAdherence(currentAdherencePercent, outcome);
  const riskPercent = computeRiskPercent(adherencePercent);
  return {
    adherencePercent,
    riskPercent,
    riskTagline: riskTagline(adherencePercent, missedDoseCount),
  };
}

// ─────────────────────────────────────────────────────────────────
// Triage categorization — shared threshold logic for the Triage
// Dashboard's red/amber/green rows and its top-line metric counts
// ─────────────────────────────────────────────────────────────────

export function riskToTriageStatus(riskPercent: number): TriageRiskStatus {
  if (riskPercent >= 70) return "red";
  if (riskPercent >= 40) return "amber";
  return "green";
}

export function computeTriageMetrics(
  patients: { riskPercent: number }[],
  missedDosesByPatient: number[]
): TriageMetrics {
  const highRiskCount = patients.filter((p) => riskToTriageStatus(p.riskPercent) === "red").length;
  const stableCount = patients.filter((p) => riskToTriageStatus(p.riskPercent) === "green").length;
  const missedDosesCount = missedDosesByPatient.reduce((sum, n) => sum + n, 0);
  return { highRiskCount, missedDosesCount, stableCount };
}
