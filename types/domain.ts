// types/domain.ts
//
// Single source of truth for entity shapes used across mock data
// (lib/mock/), stores (stores/), and every role-specific view
// (Patient / Caregiver / Clinician).
//
// Two deliberately separate models worth calling out:
//   - Alert:        system-generated, one-shot, has a status lifecycle
//   - Conversation:  human-originated, persistent, never "resolves"

// ─────────────────────────────────────────────────────────────────
// Roles & Accounts
// ─────────────────────────────────────────────────────────────────

export type Role = "patient" | "caregiver" | "clinician" | "hospital_admin";

interface BaseUserAccount {
  id: string;
  role: Role;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface PatientAccount extends BaseUserAccount {
  role: "patient";
  appPreferences: {
    discreetMode: boolean;
    offlineSyncEnabled: boolean;
    notificationSounds: boolean;
    languagePreference: "en" | "es" | "fr";
  };
}

export interface CaregiverAccount extends BaseUserAccount {
  role: "caregiver";
  relationshipToPatient: string; // e.g. "Mother"
  assignedPatientIds: string[];
  alertPreferences: {
    notifyOnMissedDose: boolean;
    notifyOnVitalSpike: boolean;
  };
}

export interface ClinicianAccount extends BaseUserAccount {
  role: "clinician" | "hospital_admin";
  hospital: string;
  department: string;
  npiId: string;
  clinicalNotesSignature: string; // mocked signature block
  assignedPatientIds: string[];
}

export type UserAccount = PatientAccount | CaregiverAccount | ClinicianAccount;

// ─────────────────────────────────────────────────────────────────
// Care Team
// ─────────────────────────────────────────────────────────────────

export interface CareTeamMember {
  userId: string;
  role: Role;
  name: string;
  avatarUrl?: string;
  onlineStatus: "online" | "offline";
}

// ─────────────────────────────────────────────────────────────────
// Clinical Profile (patients only — caregivers/clinicians view it,
// they don't have one of their own)
// ─────────────────────────────────────────────────────────────────

export interface Allergy {
  id: string;
  substance: string;
  reaction: string;
  severity: "mild" | "moderate" | "severe";
}

export interface ClinicalNote {
  id: string;
  patientId: string;
  authorId: string; // clinician userId
  authorName: string;
  body: string;
  createdAt: string; // ISO timestamp
}

export interface PatientClinicalProfile {
  patientId: string;
  demographics: {
    dateOfBirth: string;
    gender: string;
    heightCm?: number;
    weightKg?: number;
  };
  allergies: Allergy[];
  medicationIds: string[];
  careTeamIds: string[]; // CareTeamMember.userId references
  clinicalNotes: ClinicalNote[];
  htparLog: HtparObservation[];
}

// HTPAR / M2PI2 clinical observation capture. Kept separate from
// VitalReading — this is a single 5-slider form (Health, Temperature,
// Pain, Activity, Respiration), not a stream of individual metrics.
export interface HtparObservation {
  id: string;
  patientId: string;
  recordedBy: string; // clinician userId
  recordedAt: string; // ISO timestamp
  health: number; // 1-5
  temperature: number; // 1-5
  pain: number; // 1-5
  activity: number; // 1-5
  respiration: number; // 1-5
}

// ─────────────────────────────────────────────────────────────────
// Medications & Doses
// ─────────────────────────────────────────────────────────────────

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  discreetLabel: string; // e.g. "💊 Dose A" — shown when discreetMode is on
  dosage: string; // e.g. "500mg"
  scheduleTimes: string[]; // e.g. ["08:00", "20:00"]
  nextRefillDate: string; // ISO date
  refillAutoEnabled: boolean;
}

export type DoseSource = "patient_timer" | "clinician_override" | "caregiver_nudge";

export interface DoseEvent {
  id: string;
  patientId: string;
  medicationId: string;
  scheduledTime: string; // ISO timestamp
  takenAt?: string; // ISO timestamp — undefined means not yet taken
  source?: DoseSource; // set once takenAt is filled in
}

// ─────────────────────────────────────────────────────────────────
// Vitals
// ─────────────────────────────────────────────────────────────────

export type VitalMetric = "bloodPressure" | "heartRate";

export interface VitalReading {
  id: string;
  patientId: string;
  metric: VitalMetric;
  value: string; // "120/80" for bloodPressure, "72" for heartRate
  recordedAt: string; // ISO timestamp
}

// ─────────────────────────────────────────────────────────────────
// AI Risk Prediction
// ─────────────────────────────────────────────────────────────────

export interface RiskPrediction {
  patientId: string;
  riskPercent: number; // 0-100, recalculated by lib/utils/risk-engine.ts
  tagline: string; // e.g. "Frequent evening dose omissions detected."
  updatedAt: string;
  clinicalOverrideNote?: string; // set when a clinician overrides the score
}

// ─────────────────────────────────────────────────────────────────
// Alerts — system-generated, one-shot, resolvable
// ─────────────────────────────────────────────────────────────────

export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "active" | "acknowledged" | "resolved";
export type AlertAction =
  | "snooze"
  | "logDose"
  | "sendReminder"
  | "dismiss"
  | "acknowledge"
  | "assign"
  | "overrideRisk";

export interface Alert {
  id: string;
  patientId: string;
  targetRole: Role;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  timestamp: string; // ISO timestamp
  actions: AlertAction[]; // drives which action buttons render
}

// ─────────────────────────────────────────────────────────────────
// Conversations & Messages — human-originated, persistent
// ─────────────────────────────────────────────────────────────────

export type ConversationContext =
  | "patient_caregiver"
  | "patient_clinician"
  | "caregiver_clinician"
  | "clinician_clinician";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  sentAt: string; // ISO timestamp
}

export interface Conversation {
  id: string;
  participantIds: [string, string]; // exactly two participants per pair
  context: ConversationContext;
  messages: Message[];
}

// ─────────────────────────────────────────────────────────────────
// Appointments
// ─────────────────────────────────────────────────────────────────

export interface Appointment {
  id: string;
  patientId: string;
  title: string; // e.g. "Cardiology Follow-up"
  scheduledFor: string; // ISO timestamp
  location?: string;
  status: "upcoming" | "completed" | "cancelled";
}

// ─────────────────────────────────────────────────────────────────
// Refills
// ─────────────────────────────────────────────────────────────────

export interface RefillRequest {
  id: string;
  patientId: string;
  medicationId: string;
  medicationName: string; // avoids a lookup in the approval queue UI
  requestedAt: string; // ISO timestamp
  status: "pending" | "approved" | "denied";
}

// ─────────────────────────────────────────────────────────────────
// Education
// ─────────────────────────────────────────────────────────────────

export interface EducationVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  durationLabel: string; // e.g. "3:24"
  recommendedFor: string[]; // patient IDs who see this flagged as "Recommended for you"
}

// ─────────────────────────────────────────────────────────────────
// Certificates
// ─────────────────────────────────────────────────────────────────

export interface AdherenceCertificate {
  patientId: string;
  patientName: string;
  streakDays: number;
  issuedAt: string; // ISO timestamp
  qrCodeData: string; // e.g. "https://demo.adhere.app/cert/p1" — rendered as a mock QR code
}

// ─────────────────────────────────────────────────────────────────
// Sync / Trust layer
// ─────────────────────────────────────────────────────────────────

export interface SyncState {
  status: "online" | "offline" | "syncing";
  lastSyncedAt?: string;
}

// ─────────────────────────────────────────────────────────────────
// Aggregate patient record
// Assembled by lib/mock/ and lib/services/ — not a raw entity itself,
// this is the shape most role-specific views will actually consume.
// ─────────────────────────────────────────────────────────────────

export interface PatientSummary {
  account: PatientAccount;
  clinicalProfile: PatientClinicalProfile;
  medications: Medication[];
  doseEvents: DoseEvent[];
  vitals: VitalReading[];
  risk: RiskPrediction;
}
