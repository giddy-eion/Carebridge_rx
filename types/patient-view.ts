// types/patient-view.ts
//
// Screen-level data model for the Patient perspective.
// domain.ts defines the raw entities; this file composes them into
// the shape lib/services/patient-service.ts returns and every
// app/patient/* screen consumes directly.
//
// Rationale: the Patient dashboard flow (timer → history → vitals →
// risk → chat → toggles → education → certificate) touches nearly
// every entity in the system at once, so pulling it together here
// keeps components simple — they read PatientDashboardData, they
// don't assemble it themselves from six separate stores.

import type {
  PatientAccount,
  PatientClinicalProfile,
  Medication,
  DoseEvent,
  VitalReading,
  RiskPrediction,
  Alert,
  Conversation,
  CareTeamMember,
  Appointment,
  RefillRequest,
  EducationVideo,
  AdherenceCertificate,
  SyncState,
  HtparObservation,
} from "./domain";

// ── Today's dose, per medication (drives the PIU Timer) ────────────

export type DoseWindowStatus = "taken" | "due" | "upcoming" | "missed";

export interface TodayDoseWindow {
  medicationId: string;
  medicationName: string;
  discreetLabel: string;
  scheduledTime: string; // "20:00"
  status: DoseWindowStatus;
  doseEventId?: string; // set once a DoseEvent exists for this window
}

// ── Last 7 days, per medication (drives the pill-icon adherence row) ─

export interface AdherenceDay {
  date: string; // ISO date, no time
  taken: boolean;
}

export interface AdherenceHistoryEntry {
  medicationId: string;
  medicationName: string;
  last7Days: AdherenceDay[]; // oldest → newest, always length 7
}

// ── Care team, from the patient's side ──────────────────────────────

export interface PatientCareTeamEntry extends CareTeamMember {
  conversationId: string; // pre-seeded Conversation with this member
}

// ── The full composed shape ─────────────────────────────────────────

export interface PatientDashboardData {
  account: PatientAccount;
  clinicalProfile: PatientClinicalProfile;

  medications: Medication[];
  doseEvents: DoseEvent[];
  todayDoseWindows: TodayDoseWindow[]; // derived, drives PIUTimer
  adherenceHistory: AdherenceHistoryEntry[]; // derived, drives pill-icon row

  vitals: VitalReading[]; // filterable by VitalMetric in the chart. Patient can add via the log form.
  htparLog: HtparObservation[]; // view-only history — added only by a clinician, shown here as a historical clinical note
  risk: RiskPrediction;

  careTeam: PatientCareTeamEntry[];
  conversations: Conversation[]; // this patient's two allowed pairs

  alerts: Alert[]; // targetRole: 'patient', active + resolved
  appointments: Appointment[];
  refillRequests: RefillRequest[]; // this patient's own requests + status

  educationVideos: EducationVideo[];
  certificate: AdherenceCertificate;

  sync: SyncState;
}
