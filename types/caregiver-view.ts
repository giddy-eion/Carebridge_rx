// types/caregiver-view.ts
//
// Screen-level data model for the Caregiver perspective.
// Same pattern as patient-view.ts: domain.ts holds the raw entities,
// this composes them into what lib/services/caregiver-service.ts
// returns and app/caregiver/* screens consume directly.
//
// Key difference from the Patient view: a caregiver can be assigned
// to more than one patient, so almost everything here is scoped
// per-assignment rather than being a single flat record. Clinical
// data is read-only by construction — there are simply no mutation
// fields on PatientSnapshot below, matching "no edit buttons" from
// the caregiver spec.

import type {
  CaregiverAccount,
  Medication,
  DoseEvent,
  VitalReading,
  RiskPrediction,
  Alert,
  Conversation,
  CareTeamMember,
  Appointment,
  ClinicalNote,
  HtparObservation,
} from "./domain";

// ── Compact status snapshot per assigned patient ────────────────────
// Drives the "Assigned Patient Dashboard" cards: adherence ring,
// last-dose-taken, and the colored status dot.

export type PatientStatusDot = "ok" | "missed_today" | "critical";

export interface AssignedPatientCard {
  patientId: string;
  patientName: string;
  avatarUrl?: string;
  adherencePercent: number;
  lastDoseTakenAt?: string; // ISO timestamp, undefined = none taken yet
  statusDot: PatientStatusDot;
  conversationId: string; // direct line to this patient
}

// ── Read-only PIU status (DoseStatusCard, not the interactive timer) ─

export type CaregiverDoseStatus = "taken" | "due" | "missed";

export interface DoseStatusSnapshot {
  patientId: string;
  medicationId: string;
  medicationName: string;
  status: CaregiverDoseStatus; // ✅ taken / ⏳ due / ❌ missed
  scheduledTime: string;
}

// ── Read-only clinical snapshot for one assigned patient ────────────
// Deliberately has no mutation fields — caregiver view is view-only.

export interface PatientClinicalSnapshot {
  patientId: string;
  patientName: string;
  demographics: {
    dateOfBirth: string;
    gender: string;
  };
  medications: Medication[];
  doseEvents: DoseEvent[];
  vitals: VitalReading[]; // read-only chart, same VitalMetric toggle
  htparLog: HtparObservation[]; // view-only — shown as a historical clinical note, never editable here
  risk: RiskPrediction; // non-editable version of the risk card
  latestClinicalNote?: ClinicalNote; // "a note from the clinician"
}

// ── Caregiver's own care circle view (per assigned patient) ─────────

export interface CaregiverCircleEntry extends CareTeamMember {
  conversationId: string;
}

// ── The full composed shape ──────────────────────────────────────────

export interface CaregiverDashboardData {
  account: CaregiverAccount;

  assignedPatients: AssignedPatientCard[]; // landing page cards
  activePatientId: string; // which assigned patient is currently in view

  doseStatus: DoseStatusSnapshot[]; // read-only, keyed by activePatientId
  clinicalSnapshot: PatientClinicalSnapshot; // for activePatientId

  circle: CaregiverCircleEntry[]; // for activePatientId (Mom, Nurse, Dr. Smith)
  conversations: Conversation[]; // patient_caregiver + caregiver_clinician pairs

  alerts: Alert[]; // targetRole: 'caregiver', filtered to assigned patients
  appointments: Appointment[]; // for activePatientId, view-only
}
