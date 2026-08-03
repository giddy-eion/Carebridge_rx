// types/clinician-view.ts
//
// Screen-level data model for the Clinician perspective.
// Same pattern as patient-view.ts and caregiver-view.ts: domain.ts
// holds the raw entities, this composes them into what
// lib/services/clinician-service.ts returns and app/dashboard/*
// screens consume directly.
//
// This is the richest of the three views — it's the only role that
// sees aggregated, cross-patient data (Triage Dashboard, aggregated
// Alerts, Hospital Dashboard) alongside a deep single-patient view
// (Full Clinical Chart) that the other two roles only see simplified
// slices of.

import type {
  ClinicianAccount,
  Medication,
  RiskPrediction,
  Alert,
  Conversation,
  Appointment,
  RefillRequest,
  ClinicalNote,
  Allergy,
  CareTeamMember,
  VitalReading,
  HtparObservation,
} from "./domain";

// ─────────────────────────────────────────────────────────────────
// Triage Dashboard — command center, landing page
// ─────────────────────────────────────────────────────────────────

export type TriageRiskStatus = "red" | "amber" | "green";

export interface TriagePatientRow {
  patientId: string;
  patientName: string;
  avatarUrl?: string;
  riskStatus: TriageRiskStatus;
  adherencePercent: number;
  lastDoseAt?: string; // ISO timestamp
  missedDoseCount: number; // rolling window, e.g. last 7 days
}

export interface TriageMetrics {
  highRiskCount: number;
  missedDosesCount: number; // aggregate, all patients
  stableCount: number;
}

// ─────────────────────────────────────────────────────────────────
// Adherence Timeline Log — clinician's version of the PIU timer
// ─────────────────────────────────────────────────────────────────

export type AdherenceLogSource = "patient_timer" | "clinician_override";

export interface AdherenceLogEntry {
  date: string; // ISO date
  status: "taken" | "missed";
  takenAtLabel?: string; // e.g. "8:03 AM", display-only
  source?: AdherenceLogSource;
  doseEventId: string; // target for the "Mark as Taken" override action
}

// ─────────────────────────────────────────────────────────────────
// Full Clinical Chart — Patient Detail view
// ─────────────────────────────────────────────────────────────────

export interface FullClinicalChart {
  patientId: string;
  patientName: string;
  demographics: {
    dateOfBirth: string;
    gender: string;
  };
  allergies: Allergy[];
  medications: Medication[]; // each has an available "Order Refill" action
  labResultsPlaceholder: string; // e.g. "No results on file"
  clinicalNotes: ClinicalNote[]; // editable — "Add Clinical Note"
  vitals: VitalReading[]; // view-only for clinician — entered by patient/device, never manually here
  risk: RiskPrediction; // editable — override note supported
  adherenceLog: AdherenceLogEntry[]; // last 7 days, override action per entry
  observations: HtparObservation[]; // HTPAR history — clinician is the only role that can add via "Add HTPAR"
}

// ─────────────────────────────────────────────────────────────────
// Care Team Oversight Hub
// ─────────────────────────────────────────────────────────────────

export interface CareTeamActivityEntry {
  memberId: string;
  memberName: string;
  memberRole: "caregiver" | "clinician";
  activity: string; // e.g. "Sent reminder to John Doe", "Viewed vitals"
  timestamp: string; // ISO timestamp
}

export interface CareTeamOversight {
  patientId: string;
  members: CareTeamMember[];
  recentActivity: CareTeamActivityEntry[];
}

// ─────────────────────────────────────────────────────────────────
// Hospital Dashboard — enterprise analytics (static stub)
// ─────────────────────────────────────────────────────────────────

export interface HospitalAnalytics {
  totalPatients: number;
  monthlyActiveUsers: number;
  averageAdherenceRate: number; // percent
  subscriptionTier: string; // e.g. "Enterprise"
  revenueBarChart: { month: string; value: number }[]; // mock series
}

// ─────────────────────────────────────────────────────────────────
// The full composed shape
// ─────────────────────────────────────────────────────────────────

export interface ClinicianDashboardData {
  account: ClinicianAccount;

  triageRows: TriagePatientRow[];
  triageMetrics: TriageMetrics; // recalculates as actions are taken

  activePatientId?: string; // set when viewing Patient Detail
  activeChart?: FullClinicalChart; // populated for activePatientId

  alerts: Alert[]; // targetRole: 'clinician', aggregated across all patients
  refillRequests: RefillRequest[]; // pending approval queue
  appointments: Appointment[]; // across all patients, calendar view

  careTeamOversight?: CareTeamOversight; // populated for activePatientId
  conversations: Conversation[]; // patient_clinician, caregiver_clinician, clinician_clinician

  hospitalAnalytics: HospitalAnalytics; // Hospital Dashboard page
}
