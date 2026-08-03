// stores/patients-store.ts
//
// The single mutable "database" the whole app reads from during a
// demo session. Seeded once from lib/mock/fixtures.ts, then mutated
// by role actions (PIU Timer, clinician override, refill approval,
// alert acknowledgment, ...). Everything here is in-memory only —
// refreshing the page resets the demo, which is fine for a prototype.
//
// Deliberate design point: TodayDoseWindow[] and AdherenceHistoryEntry[]
// (from patient-view.ts) are NOT stored here — they're recomputed on
// every read via lib/utils/risk-engine.ts, straight from doseEvents.
// adherencePercent/riskPercent ARE stored, because they're EMA-based
// (see risk-engine.ts) — they carry memory across actions, so they
// can't be freshly re-derived from raw counts alone.

import { create } from "zustand";
import type {
  DoseEvent,
  Medication,
  VitalReading,
  HtparObservation,
  ClinicalNote,
  Alert,
  RefillRequest,
  Appointment,
  Conversation,
  Message,
  DoseSource,
} from "@/types/domain";
import type { TriagePatientRow, TriageMetrics } from "@/types/clinician-view";
import {
  computeMissedDoseCount,
  recomputeAfterDoseOutcome,
  computeTriageMetrics,
  riskToTriageStatus,
} from "@/lib/utils/risk-engine";
import {
  medications as seedMedications,
  doseEvents as seedDoseEvents,
  vitalReadings as seedVitalReadings,
  htparObservations as seedHtparObservations,
  patientClinicalProfiles as seedClinicalProfiles,
  patientDirectory as seedPatientDirectory,
  riskPredictions as seedRiskPredictions,
  alerts as seedAlerts,
  refillRequests as seedRefillRequests,
  appointments as seedAppointments,
  conversations as seedConversations,
} from "@/lib/mock/fixtures";

// ─────────────────────────────────────────────────────────────────
// Per-patient runtime record
// ─────────────────────────────────────────────────────────────────

export interface PatientRuntimeState {
  patientId: string;
  patientName: string;
  avatarUrl?: string;

  medications: Medication[];
  doseEvents: DoseEvent[];
  vitals: VitalReading[];
  htparLog: HtparObservation[];
  clinicalNotes: ClinicalNote[];

  adherencePercent: number; // EMA-based headline score, see risk-engine.ts
  riskPercent: number; // derived from adherencePercent
  riskTagline: string;
  riskOverrideNote?: string; // set via a clinician's "Override Risk" action
  missedDoseCount: number; // literal 7-day tally, independent of the EMA
}

// ─────────────────────────────────────────────────────────────────
// Store shape
// ─────────────────────────────────────────────────────────────────

interface PatientsStoreState {
  patients: Record<string, PatientRuntimeState>;
  alerts: Alert[];
  refillRequests: RefillRequest[];
  appointments: Appointment[];
  conversations: Conversation[];

  // ── Dose actions ──
  logDose: (patientId: string, medicationId: string, scheduledTime: string, source?: DoseSource) => void;
  markDoseTakenByClinician: (patientId: string, doseEventId: string) => void;

  // ── Alert actions ──
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;

  // ── Refill actions ──
  approveRefill: (refillId: string) => void;
  denyRefill: (refillId: string) => void;

  // ── Clinical note / risk override actions ──
  addClinicalNote: (patientId: string, note: Omit<ClinicalNote, "id" | "createdAt">) => void;
  setRiskOverrideNote: (patientId: string, note: string) => void;

  // ── Messaging ──
  sendMessage: (conversationId: string, senderId: string, body: string) => void;

  // ── Selectors (computed on read, not stored) ──
  getTriageRows: () => TriagePatientRow[];
  getTriageMetrics: () => TriageMetrics;
}

// ─────────────────────────────────────────────────────────────────
// Seed → initial state
// ─────────────────────────────────────────────────────────────────

function buildInitialPatients(): Record<string, PatientRuntimeState> {
  const result: Record<string, PatientRuntimeState> = {};
  for (const entry of seedPatientDirectory) {
    const risk = seedRiskPredictions.find((r) => r.patientId === entry.patientId);
    const profile = seedClinicalProfiles.find((p) => p.patientId === entry.patientId);
    result[entry.patientId] = {
      patientId: entry.patientId,
      patientName: entry.name,
      avatarUrl: entry.avatarUrl,
      medications: seedMedications.filter((m) => m.patientId === entry.patientId),
      doseEvents: seedDoseEvents.filter((d) => d.patientId === entry.patientId),
      vitals: seedVitalReadings.filter((v) => v.patientId === entry.patientId),
      htparLog: seedHtparObservations.filter((h) => h.patientId === entry.patientId),
      clinicalNotes: profile?.clinicalNotes ?? [],
      adherencePercent: entry.adherencePercent,
      riskPercent: risk?.riskPercent ?? entry.riskPercent,
      riskTagline: risk?.tagline ?? "",
      missedDoseCount: entry.missedDoseCount,
    };
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────

export const usePatientsStore = create<PatientsStoreState>()((set, get) => ({
  patients: buildInitialPatients(),
  alerts: seedAlerts,
  refillRequests: seedRefillRequests,
  appointments: seedAppointments,
  conversations: seedConversations,

  logDose: (patientId, medicationId, scheduledTime, source = "patient_timer") => {
    set((state) => {
      const patient = state.patients[patientId];
      if (!patient) return {};

      const nowIso = new Date().toISOString();
      let matched = false;
      const doseEvents = patient.doseEvents.map((e) => {
        if (
          e.medicationId === medicationId &&
          e.scheduledTime.slice(0, 16) === scheduledTime.slice(0, 16)
        ) {
          matched = true;
          return { ...e, takenAt: nowIso, source };
        }
        return e;
      });
      if (!matched) {
        doseEvents.push({
          id: `de-${medicationId}-${Date.now()}`,
          patientId,
          medicationId,
          scheduledTime,
          takenAt: nowIso,
          source,
        });
      }

      const missedDoseCount = computeMissedDoseCount(doseEvents);
      const { adherencePercent, riskPercent, riskTagline } = recomputeAfterDoseOutcome(
        patient.adherencePercent,
        "taken",
        missedDoseCount
      );

      return {
        patients: {
          ...state.patients,
          [patientId]: {
            ...patient,
            doseEvents,
            missedDoseCount,
            adherencePercent,
            riskPercent,
            riskTagline,
          },
        },
      };
    });
  },

  markDoseTakenByClinician: (patientId, doseEventId) => {
    set((state) => {
      const patient = state.patients[patientId];
      if (!patient) return {};

      const nowIso = new Date().toISOString();
      const doseEvents = patient.doseEvents.map((e) =>
        e.id === doseEventId ? { ...e, takenAt: nowIso, source: "clinician_override" as DoseSource } : e
      );

      const missedDoseCount = computeMissedDoseCount(doseEvents);
      const { adherencePercent, riskPercent, riskTagline } = recomputeAfterDoseOutcome(
        patient.adherencePercent,
        "taken",
        missedDoseCount
      );

      return {
        patients: {
          ...state.patients,
          [patientId]: {
            ...patient,
            doseEvents,
            missedDoseCount,
            adherencePercent,
            riskPercent,
            riskTagline,
          },
        },
      };
    });
  },

  acknowledgeAlert: (alertId) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, status: "acknowledged" } : a)),
    }));
  },

  resolveAlert: (alertId) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, status: "resolved" } : a)),
    }));
  },

  approveRefill: (refillId) => {
    set((state) => ({
      refillRequests: state.refillRequests.map((r) =>
        r.id === refillId ? { ...r, status: "approved" } : r
      ),
    }));
  },

  denyRefill: (refillId) => {
    set((state) => ({
      refillRequests: state.refillRequests.map((r) =>
        r.id === refillId ? { ...r, status: "denied" } : r
      ),
    }));
  },

  addClinicalNote: (patientId, note) => {
    set((state) => {
      const patient = state.patients[patientId];
      if (!patient) return {};
      const newNote: ClinicalNote = {
        ...note,
        id: `note-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      return {
        patients: {
          ...state.patients,
          [patientId]: { ...patient, clinicalNotes: [...patient.clinicalNotes, newNote] },
        },
      };
    });
  },

  setRiskOverrideNote: (patientId, note) => {
    set((state) => {
      const patient = state.patients[patientId];
      if (!patient) return {};
      return {
        patients: {
          ...state.patients,
          [patientId]: { ...patient, riskOverrideNote: note },
        },
      };
    });
  },

  sendMessage: (conversationId, senderId, body) => {
    set((state) => ({
      conversations: state.conversations.map((c) => {
        if (c.id !== conversationId) return c;
        const message: Message = {
          id: `msg-${Date.now()}`,
          conversationId,
          senderId,
          body,
          sentAt: new Date().toISOString(),
        };
        return { ...c, messages: [...c.messages, message] };
      }),
    }));
  },

  getTriageRows: () => {
    const { patients } = get();
    return Object.values(patients).map((p): TriagePatientRow => {
      const lastTaken = p.doseEvents
        .filter((e) => e.takenAt)
        .sort((a, b) => (a.takenAt! < b.takenAt! ? 1 : -1))[0];
      return {
        patientId: p.patientId,
        patientName: p.patientName,
        avatarUrl: p.avatarUrl,
        riskStatus: riskToTriageStatus(p.riskPercent),
        adherencePercent: p.adherencePercent,
        lastDoseAt: lastTaken?.takenAt,
        missedDoseCount: p.missedDoseCount,
      };
    });
  },

  getTriageMetrics: () => {
    const { patients } = get();
    const rows = Object.values(patients);
    return computeTriageMetrics(
      rows.map((p) => ({ riskPercent: p.riskPercent })),
      rows.map((p) => p.missedDoseCount)
    );
  },
}));
