// lib/mock/fixtures.ts
//
// The "database" for the prototype. Everything here is static data,
// assembled once at module load. lib/services/*.ts read from these
// arrays and filter/shape them into the view-model types; stores/
// hold the mutable copies that actually change during the demo
// (see stores/patients-store.ts).
//
// Naming note: your spec referred to the caregiver-circle clinician
// as "Dr. Smith" in some places and the flagship-flow clinician as
// "Dr. Sarah" in others. I've treated them as the same person —
// Dr. Sarah Chen — since John's treating physician and the person
// logging in as Clinician should be identical for the demo to hang
// together. Flag if you actually intended two distinct clinicians.
//
// Three people are "live" (selectable at the Role Selection Portal):
//   John Doe       — Patient    (p1 / u-patient-1)
//   Linda Doe      — Caregiver  (u-caregiver-1, John's mother)
//   Dr. Sarah Chen — Clinician  (u-clinician-1)
// Everyone else (Nurse Jane, and patients p2–p8) is backdrop —
// real enough to reference, but not a role you can log in as.

import type {
  PatientAccount,
  CaregiverAccount,
  ClinicianAccount,
  CareTeamMember,
  PatientClinicalProfile,
  Medication,
  DoseEvent,
  VitalReading,
  HtparObservation,
  RiskPrediction,
  Alert,
  Conversation,
  Appointment,
  RefillRequest,
  EducationVideo,
  AdherenceCertificate,
  SyncState,
} from "@/types/domain";

// ─────────────────────────────────────────────────────────────────
// Date helpers — every timestamp is relative to "now" so the demo's
// "last 7 days" always looks current, no matter when it's run.
// ─────────────────────────────────────────────────────────────────

function isoDaysAgo(days: number, hour = 8, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function isoDaysFromNow(days: number, hour = 8, minute = 0): string {
  return isoDaysAgo(-days, hour, minute);
}

function isoDateOnlyDaysAgo(days: number): string {
  return isoDaysAgo(days).slice(0, 10);
}

// ─────────────────────────────────────────────────────────────────
// User Accounts — the three "live" demo logins
// ─────────────────────────────────────────────────────────────────

export const johnDoeAccount: PatientAccount = {
  id: "u-patient-1",
  role: "patient",
  name: "John Doe",
  email: "john.doe@example.com",
  avatarUrl: "/avatars/john-doe.png",
  appPreferences: {
    discreetMode: false,
    offlineSyncEnabled: true,
    notificationSounds: true,
    languagePreference: "en",
  },
};

export const lindaDoeAccount: CaregiverAccount = {
  id: "u-caregiver-1",
  role: "caregiver",
  name: "Linda Doe",
  email: "linda.doe@example.com",
  avatarUrl: "/avatars/linda-doe.png",
  relationshipToPatient: "Mother",
  assignedPatientIds: ["p1"],
  alertPreferences: {
    notifyOnMissedDose: true,
    notifyOnVitalSpike: true,
  },
};

export const drSarahChenAccount: ClinicianAccount = {
  id: "u-clinician-1",
  role: "clinician",
  name: "Dr. Sarah Chen",
  email: "sarah.chen@metrogeneral.org",
  avatarUrl: "/avatars/dr-sarah-chen.png",
  hospital: "Metro General Hospital",
  department: "Internal Medicine",
  npiId: "1043827561",
  clinicalNotesSignature: "Sarah Chen, MD — Internal Medicine, Metro General",
  assignedPatientIds: ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"],
};

// Backdrop care-team member — appears in John's circle and in the
// clinician↔clinician conversation, but isn't a selectable login.
export const nurseJane: CareTeamMember = {
  userId: "u-nurse-1",
  role: "clinician",
  name: "Nurse Jane Wu",
  avatarUrl: "/avatars/nurse-jane.png",
  onlineStatus: "online",
};

// ─────────────────────────────────────────────────────────────────
// John's Care Team (Caregiver Circle)
// ─────────────────────────────────────────────────────────────────

export const johnCareTeam: CareTeamMember[] = [
  {
    userId: lindaDoeAccount.id,
    role: "caregiver",
    name: lindaDoeAccount.name,
    avatarUrl: lindaDoeAccount.avatarUrl,
    onlineStatus: "online",
  },
  {
    userId: drSarahChenAccount.id,
    role: "clinician",
    name: drSarahChenAccount.name,
    avatarUrl: drSarahChenAccount.avatarUrl,
    onlineStatus: "online",
  },
  nurseJane,
];

// ─────────────────────────────────────────────────────────────────
// HTPAR Observations — clinician-recorded, visible to all three roles
// (defined here, ahead of patientClinicalProfiles, so it can be
// referenced directly rather than left as a placeholder)
// ─────────────────────────────────────────────────────────────────

export const htparObservations: HtparObservation[] = [
  {
    id: "htpar-1",
    patientId: "p1",
    recordedBy: drSarahChenAccount.id,
    recordedAt: isoDaysAgo(2, 14, 30),
    health: 3,
    temperature: 3,
    pain: 2,
    activity: 2,
    respiration: 3,
  },
  {
    id: "htpar-2",
    patientId: "p1",
    recordedBy: drSarahChenAccount.id,
    recordedAt: isoDaysAgo(9, 10, 0),
    health: 2,
    temperature: 3,
    pain: 3,
    activity: 2,
    respiration: 3,
  },
  {
    id: "htpar-3",
    patientId: "p2",
    recordedBy: drSarahChenAccount.id,
    recordedAt: isoDaysAgo(4, 9, 30),
    health: 3,
    temperature: 3,
    pain: 2,
    activity: 3,
    respiration: 3,
  },
  {
    id: "htpar-4",
    patientId: "p3",
    recordedBy: drSarahChenAccount.id,
    recordedAt: isoDaysAgo(5, 15, 0),
    health: 2,
    temperature: 3,
    pain: 3,
    activity: 2,
    respiration: 2,
  },
];

// ─────────────────────────────────────────────────────────────────
// Patient population (Triage Dashboard breadth)
// John (p1), Mary (p2), and Robert (p3) get full depth because
// they're referenced by name in your spec. p4–p8 are lighter —
// enough to make the Triage Dashboard look like a real population.
// ─────────────────────────────────────────────────────────────────

export const patientClinicalProfiles: PatientClinicalProfile[] = [
  {
    patientId: "p1",
    demographics: { dateOfBirth: "1958-03-14", gender: "Male", heightCm: 178, weightKg: 84 },
    allergies: [
      { id: "al-1", substance: "Penicillin", reaction: "Hives", severity: "moderate" },
    ],
    medicationIds: ["m1", "m2"],
    careTeamIds: [lindaDoeAccount.id, drSarahChenAccount.id, nurseJane.userId],
    clinicalNotes: [
      {
        id: "note-1",
        patientId: "p1",
        authorId: drSarahChenAccount.id,
        authorName: drSarahChenAccount.name,
        body: "Patient reports occasional dizziness in the evenings. Monitoring alongside adherence data.",
        createdAt: isoDaysAgo(2, 14, 30),
      },
    ],
    htparLog: htparObservations.filter((o) => o.patientId === "p1"),
  },
  {
    patientId: "p2",
    demographics: { dateOfBirth: "1965-07-02", gender: "Female" },
    allergies: [],
    medicationIds: ["m3"],
    careTeamIds: [drSarahChenAccount.id],
    clinicalNotes: [],
    htparLog: [],
  },
  {
    patientId: "p3",
    demographics: { dateOfBirth: "1972-11-19", gender: "Male" },
    allergies: [{ id: "al-2", substance: "Sulfa drugs", reaction: "Rash", severity: "mild" }],
    medicationIds: ["m4"],
    careTeamIds: [drSarahChenAccount.id],
    clinicalNotes: [],
    htparLog: [],
  },
  {
    patientId: "p4",
    demographics: { dateOfBirth: "1950-01-08", gender: "Female" },
    allergies: [],
    medicationIds: ["m5"],
    careTeamIds: [drSarahChenAccount.id],
    clinicalNotes: [],
    htparLog: [],
  },
  {
    patientId: "p5",
    demographics: { dateOfBirth: "1980-09-23", gender: "Male" },
    allergies: [],
    medicationIds: ["m6"],
    careTeamIds: [drSarahChenAccount.id],
    clinicalNotes: [],
    htparLog: [],
  },
  {
    patientId: "p6",
    demographics: { dateOfBirth: "1975-05-30", gender: "Female" },
    allergies: [],
    medicationIds: ["m7"],
    careTeamIds: [drSarahChenAccount.id],
    clinicalNotes: [],
    htparLog: [],
  },
  {
    patientId: "p7",
    demographics: { dateOfBirth: "1962-02-11", gender: "Male" },
    allergies: [],
    medicationIds: ["m8"],
    careTeamIds: [drSarahChenAccount.id],
    clinicalNotes: [],
    htparLog: [],
  },
  {
    patientId: "p8",
    demographics: { dateOfBirth: "1988-12-04", gender: "Female" },
    allergies: [],
    medicationIds: ["m9"],
    careTeamIds: [drSarahChenAccount.id],
    clinicalNotes: [],
    htparLog: [],
  },
];

// Flat lookup used by the Triage Dashboard and by AssignedPatientCard —
// the plain facts a row needs, independent of the deep-dive detail.
export const patientDirectory: {
  patientId: string;
  name: string;
  avatarUrl?: string;
  adherencePercent: number;
  riskPercent: number;
  missedDoseCount: number;
}[] = [
  { patientId: "p1", name: "John Doe", avatarUrl: "/avatars/john-doe.png", adherencePercent: 42, riskPercent: 82, missedDoseCount: 3 },
  { patientId: "p2", name: "Mary Smith", avatarUrl: "/avatars/mary-smith.png", adherencePercent: 55, riskPercent: 75, missedDoseCount: 2 },
  { patientId: "p3", name: "Robert Chen", avatarUrl: "/avatars/robert-chen.png", adherencePercent: 60, riskPercent: 71, missedDoseCount: 2 },
  { patientId: "p4", name: "Angela Kim", avatarUrl: "/avatars/angela-kim.png", adherencePercent: 30, riskPercent: 88, missedDoseCount: 4 },
  { patientId: "p5", name: "Carlos Ruiz", avatarUrl: "/avatars/carlos-ruiz.png", adherencePercent: 70, riskPercent: 55, missedDoseCount: 1 },
  { patientId: "p6", name: "Grace Lee", avatarUrl: "/avatars/grace-lee.png", adherencePercent: 75, riskPercent: 42, missedDoseCount: 1 },
  { patientId: "p7", name: "Tom Baker", avatarUrl: "/avatars/tom-baker.png", adherencePercent: 95, riskPercent: 20, missedDoseCount: 0 },
  { patientId: "p8", name: "Nina Patel", avatarUrl: "/avatars/nina-patel.png", adherencePercent: 98, riskPercent: 15, missedDoseCount: 0 },
];
// riskPercent >= 70 -> red/high-risk (p1, p2, p3, p4 = 4, matching your "🚨 High Risk (4)")
// riskPercent 40-69 -> amber                                  (p5, p6)
// riskPercent < 40   -> green/stable                          (p7, p8)

// ─────────────────────────────────────────────────────────────────
// Medications
// ─────────────────────────────────────────────────────────────────

export const medications: Medication[] = [
  {
    id: "m1",
    patientId: "p1",
    name: "Metformin",
    discreetLabel: "💊 Dose A",
    dosage: "500mg",
    scheduleTimes: ["08:00", "20:00"],
    nextRefillDate: isoDateOnlyDaysAgo(-11),
    refillAutoEnabled: false,
  },
  {
    id: "m2",
    patientId: "p1",
    name: "Lisinopril",
    discreetLabel: "💊 Dose B",
    dosage: "10mg",
    scheduleTimes: ["08:00"],
    nextRefillDate: isoDateOnlyDaysAgo(-3),
    refillAutoEnabled: true,
  },
  {
    id: "m3",
    patientId: "p2",
    name: "Lisinopril",
    discreetLabel: "💊 Dose A",
    dosage: "20mg",
    scheduleTimes: ["09:00"],
    nextRefillDate: isoDateOnlyDaysAgo(-14),
    refillAutoEnabled: true,
  },
  {
    id: "m4",
    patientId: "p3",
    name: "Atorvastatin",
    discreetLabel: "💊 Dose A",
    dosage: "40mg",
    scheduleTimes: ["21:00"],
    nextRefillDate: isoDateOnlyDaysAgo(0),
    refillAutoEnabled: false,
  },
  { id: "m5", patientId: "p4", name: "Warfarin", discreetLabel: "💊 Dose A", dosage: "5mg", scheduleTimes: ["18:00"], nextRefillDate: isoDateOnlyDaysAgo(-9), refillAutoEnabled: false },
  { id: "m6", patientId: "p5", name: "Amlodipine", discreetLabel: "💊 Dose A", dosage: "5mg", scheduleTimes: ["08:00"], nextRefillDate: isoDateOnlyDaysAgo(-20), refillAutoEnabled: true },
  { id: "m7", patientId: "p6", name: "Levothyroxine", discreetLabel: "💊 Dose A", dosage: "75mcg", scheduleTimes: ["07:00"], nextRefillDate: isoDateOnlyDaysAgo(-18), refillAutoEnabled: true },
  { id: "m8", patientId: "p7", name: "Losartan", discreetLabel: "💊 Dose A", dosage: "50mg", scheduleTimes: ["08:00"], nextRefillDate: isoDateOnlyDaysAgo(-25), refillAutoEnabled: true },
  { id: "m9", patientId: "p8", name: "Sertraline", discreetLabel: "💊 Dose A", dosage: "50mg", scheduleTimes: ["08:00"], nextRefillDate: isoDateOnlyDaysAgo(-22), refillAutoEnabled: true },
];

// ─────────────────────────────────────────────────────────────────
// Dose Events — John gets a full, realistic 7-day history:
// morning Metformin/Lisinopril mostly taken, evening Metformin
// missed 3 times this week (the exact story your risk card tells).
// ─────────────────────────────────────────────────────────────────

function johnDoseHistory(): DoseEvent[] {
  const events: DoseEvent[] = [];
  // Evening Metformin (m1, 20:00): missed on days 1, 3, 5. Today (day 0) is
  // the one PENDING dose — this is what the PIU Timer's "Take Now" acts on.
  const eveningMissedDays = [1, 3, 5];
  for (let day = 6; day >= 0; day--) {
    const missed = day === 0 ? true : eveningMissedDays.includes(day); // day 0 starts pending/unlogged
    events.push({
      id: `de-m1-evening-${day}`,
      patientId: "p1",
      medicationId: "m1",
      scheduledTime: isoDaysAgo(day, 20, 0),
      takenAt: missed ? undefined : isoDaysAgo(day, 20, 6),
      source: missed ? undefined : "patient_timer",
    });
  }
  // Morning Metformin (m1, 08:00): taken every day this week, including today
  // — it's evening in the story, so this morning's dose already happened.
  for (let day = 6; day >= 0; day--) {
    events.push({
      id: `de-m1-morning-${day}`,
      patientId: "p1",
      medicationId: "m1",
      scheduledTime: isoDaysAgo(day, 8, 0),
      takenAt: isoDaysAgo(day, 8, 4),
      source: "patient_timer",
    });
  }
  // Lisinopril (m2, 08:00): taken every day, one clinician-validated (DOT) entry
  for (let day = 6; day >= 0; day--) {
    events.push({
      id: `de-m2-${day}`,
      patientId: "p1",
      medicationId: "m2",
      scheduledTime: isoDaysAgo(day, 8, 0),
      takenAt: isoDaysAgo(day, 8, 5),
      source: day === 4 ? "clinician_override" : "patient_timer",
    });
  }
  return events;
}

export const doseEvents: DoseEvent[] = [
  ...johnDoseHistory(),
  // Lighter single-medication history for p2 and p3 for texture
  ...[2, 1, 0].map((day) => ({
    id: `de-m3-${day}`,
    patientId: "p2",
    medicationId: "m3",
    scheduledTime: isoDaysAgo(day, 9, 0),
    takenAt: day === 1 ? undefined : isoDaysAgo(day, 9, 3),
    source: (day === 1 ? undefined : "patient_timer") as DoseEvent["source"],
  })),
  ...[2, 1, 0].map((day) => ({
    id: `de-m4-${day}`,
    patientId: "p3",
    medicationId: "m4",
    scheduledTime: isoDaysAgo(day, 21, 0),
    takenAt: day === 2 ? undefined : isoDaysAgo(day, 21, 4),
    source: (day === 2 ? undefined : "patient_timer") as DoseEvent["source"],
  })),
];

// ─────────────────────────────────────────────────────────────────
// Vitals — John gets a full 7-day BP + heart-rate series with a
// slight improvement on the most recent reading (the "chart updates"
// beat in step 5 of the flagship flow).
// ─────────────────────────────────────────────────────────────────

export const vitalReadings: VitalReading[] = [
  ...[6, 5, 4, 3, 2, 1, 0].map((day, i) => ({
    id: `vr-bp-p1-${day}`,
    patientId: "p1",
    metric: "bloodPressure" as const,
    value: i < 6 ? "148/95" : "132/86", // today's reading improves
    recordedAt: isoDaysAgo(day, 7, 30),
  })),
  ...[6, 5, 4, 3, 2, 1, 0].map((day, i) => ({
    id: `vr-hr-p1-${day}`,
    patientId: "p1",
    metric: "heartRate" as const,
    value: i < 6 ? "88" : "76",
    recordedAt: isoDaysAgo(day, 7, 30),
  })),
  // Mary Smith — the BP spike referenced in your spec
  ...[3, 2, 1, 0].map((day, i) => ({
    id: `vr-bp-p2-${day}`,
    patientId: "p2",
    metric: "bloodPressure" as const,
    value: i === 3 ? "155/95" : "138/88",
    recordedAt: isoDaysAgo(day, 8, 0),
  })),
];

// ─────────────────────────────────────────────────────────────────
// Risk Predictions — one per patient, matching patientDirectory
// ─────────────────────────────────────────────────────────────────

export const riskPredictions: RiskPrediction[] = [
  {
    patientId: "p1",
    riskPercent: 82,
    tagline: "Frequent evening dose omissions detected.",
    updatedAt: isoDaysAgo(0, 6, 0),
  },
  { patientId: "p2", riskPercent: 75, tagline: "Elevated blood pressure trending upward over 5 days.", updatedAt: isoDaysAgo(0, 6, 0) },
  { patientId: "p3", riskPercent: 71, tagline: "Refill overdue combined with declining adherence.", updatedAt: isoDaysAgo(0, 6, 0) },
  { patientId: "p4", riskPercent: 88, tagline: "Severe non-adherence — anticoagulant therapy at risk.", updatedAt: isoDaysAgo(0, 6, 0) },
  { patientId: "p5", riskPercent: 55, tagline: "Adherence declining slightly over the past two weeks.", updatedAt: isoDaysAgo(0, 6, 0) },
  { patientId: "p6", riskPercent: 42, tagline: "Generally stable with occasional missed doses.", updatedAt: isoDaysAgo(0, 6, 0) },
  { patientId: "p7", riskPercent: 20, tagline: "Consistently adherent, no recent concerns.", updatedAt: isoDaysAgo(0, 6, 0) },
  { patientId: "p8", riskPercent: 15, tagline: "Excellent adherence and stable vitals.", updatedAt: isoDaysAgo(0, 6, 0) },
];

// ─────────────────────────────────────────────────────────────────
// Alerts — one full lifecycle set for John, across all three targetRoles
// ─────────────────────────────────────────────────────────────────

export const alerts: Alert[] = [
  {
    id: "alert-1",
    patientId: "p1",
    targetRole: "patient",
    severity: "warning",
    status: "active",
    message: "It's time for your evening Metformin.",
    timestamp: isoDaysAgo(0, 20, 0),
    actions: ["snooze", "logDose"],
  },
  {
    id: "alert-2",
    patientId: "p1",
    targetRole: "patient",
    severity: "info",
    status: "active",
    message: "Your refill for Lisinopril is due in 3 days.",
    timestamp: isoDaysAgo(0, 7, 0),
    actions: ["dismiss"],
  },
  {
    id: "alert-3",
    patientId: "p1",
    targetRole: "caregiver",
    severity: "critical",
    status: "active",
    message: "⚠️ John missed his evening dose (2 hours ago).",
    timestamp: isoDaysAgo(0, 20, 10),
    actions: ["sendReminder", "dismiss"],
  },
  {
    id: "alert-4",
    patientId: "p1",
    targetRole: "caregiver",
    severity: "info",
    status: "active",
    message: "📅 John has a cardiology appointment tomorrow.",
    timestamp: isoDaysAgo(0, 9, 0),
    actions: ["dismiss"],
  },
  {
    id: "alert-5",
    patientId: "p1",
    targetRole: "clinician",
    severity: "critical",
    status: "active",
    message: "🚨 3 patients at High Risk (severe non-adherence).",
    timestamp: isoDaysAgo(0, 6, 0),
    actions: ["acknowledge", "assign"],
  },
  {
    id: "alert-6",
    patientId: "p1",
    targetRole: "clinician",
    severity: "warning",
    status: "active",
    message: "⚠️ John Doe missed 3 doses this week – intervention required.",
    timestamp: isoDaysAgo(0, 6, 0),
    actions: ["acknowledge", "assign", "overrideRisk"],
  },
  {
    id: "alert-7",
    patientId: "p2",
    targetRole: "clinician",
    severity: "warning",
    status: "active",
    message: "📊 Mary Smith's BP trending up for 5 days.",
    timestamp: isoDaysAgo(1, 9, 0),
    actions: ["acknowledge", "assign"],
  },
  {
    id: "alert-8",
    patientId: "p3",
    targetRole: "clinician",
    severity: "info",
    status: "active",
    message: "🔄 Refill requested for Robert Chen (Pending approval).",
    timestamp: isoDaysAgo(0, 11, 0),
    actions: ["acknowledge"],
  },
  {
    id: "alert-9",
    patientId: "p1",
    targetRole: "patient",
    severity: "info",
    status: "resolved",
    message: "💊 Dose logged! +5 adherence points.",
    timestamp: isoDaysAgo(1, 8, 4),
    actions: [],
  },
];

// ─────────────────────────────────────────────────────────────────
// Conversations & Messages — pre-seeded per the Communication Matrix
// ─────────────────────────────────────────────────────────────────

export const conversations: Conversation[] = [
  {
    id: "conv-john-mom",
    participantIds: [johnDoeAccount.id, lindaDoeAccount.id],
    context: "patient_caregiver",
    messages: [
      {
        id: "msg-1",
        conversationId: "conv-john-mom",
        senderId: johnDoeAccount.id,
        body: "Hey Mom, feeling a bit tired today.",
        sentAt: isoDaysAgo(2, 18, 0),
      },
      {
        id: "msg-2",
        conversationId: "conv-john-mom",
        senderId: lindaDoeAccount.id,
        body: "Make sure you rest and take your evening pill!",
        sentAt: isoDaysAgo(2, 18, 5),
      },
    ],
  },
  {
    id: "conv-john-clinician",
    participantIds: [johnDoeAccount.id, drSarahChenAccount.id],
    context: "patient_clinician",
    messages: [
      {
        id: "msg-3",
        conversationId: "conv-john-clinician",
        senderId: johnDoeAccount.id,
        body: "Dr. Chen, when is my next appointment?",
        sentAt: isoDaysAgo(1, 12, 0),
      },
      {
        id: "msg-4",
        conversationId: "conv-john-clinician",
        senderId: drSarahChenAccount.id,
        body: "Cardiology follow-up is tomorrow morning — see you then!",
        sentAt: isoDaysAgo(1, 12, 10),
      },
    ],
  },
  {
    id: "conv-mom-clinician",
    participantIds: [lindaDoeAccount.id, drSarahChenAccount.id],
    context: "caregiver_clinician",
    messages: [
      {
        id: "msg-5",
        conversationId: "conv-mom-clinician",
        senderId: lindaDoeAccount.id,
        body: "Dr. Chen, John seems more tired than usual this week.",
        sentAt: isoDaysAgo(3, 19, 0),
      },
    ],
  },
  {
    id: "conv-clinician-nurse",
    participantIds: [drSarahChenAccount.id, nurseJane.userId],
    context: "clinician_clinician",
    messages: [
      {
        id: "msg-6",
        conversationId: "conv-clinician-nurse",
        senderId: drSarahChenAccount.id,
        body: "Nurse Jane, prep the lab results for John Doe's chart.",
        sentAt: isoDaysAgo(0, 7, 45),
      },
      {
        id: "msg-7",
        conversationId: "conv-clinician-nurse",
        senderId: nurseJane.userId,
        body: "On it — will have them ready before rounds.",
        sentAt: isoDaysAgo(0, 7, 50),
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// Appointments
// ─────────────────────────────────────────────────────────────────

export const appointments: Appointment[] = [
  {
    id: "appt-1",
    patientId: "p1",
    title: "Cardiology Follow-up",
    scheduledFor: isoDaysFromNow(1, 10, 0),
    location: "Metro General, Bldg B, Suite 204",
    status: "upcoming",
  },
  {
    id: "appt-2",
    patientId: "p2",
    title: "Primary Care Check-in",
    scheduledFor: isoDaysFromNow(4, 14, 0),
    location: "Metro General, Bldg A, Suite 110",
    status: "upcoming",
  },
  {
    id: "appt-3",
    patientId: "p1",
    title: "Annual Physical",
    scheduledFor: isoDaysAgo(30, 9, 0),
    location: "Metro General, Bldg A, Suite 110",
    status: "completed",
  },
  {
    id: "appt-4",
    patientId: "p3",
    title: "Cardiology Consult",
    scheduledFor: isoDaysFromNow(6, 13, 30),
    location: "Metro General, Bldg B, Suite 201",
    status: "upcoming",
  },
];

// ─────────────────────────────────────────────────────────────────
// Refill Requests
// ─────────────────────────────────────────────────────────────────

export const refillRequests: RefillRequest[] = [
  {
    id: "refill-1",
    patientId: "p3",
    medicationId: "m4",
    medicationName: "Atorvastatin",
    requestedAt: isoDaysAgo(0, 11, 0),
    status: "pending",
  },
  {
    id: "refill-2",
    patientId: "p1",
    medicationId: "m2",
    medicationName: "Lisinopril",
    requestedAt: isoDaysAgo(1, 9, 0),
    status: "pending",
  },
  {
    id: "refill-3",
    patientId: "p4",
    medicationId: "m5",
    medicationName: "Warfarin",
    requestedAt: isoDaysAgo(6, 8, 0),
    status: "approved",
  },
];

// ─────────────────────────────────────────────────────────────────
// Education Videos
// ─────────────────────────────────────────────────────────────────

export const educationVideos: EducationVideo[] = [
  {
    id: "edu-1",
    title: "Evening Dose Reminders: Why They Matter",
    thumbnailUrl: "/education/evening-dose.jpg",
    durationLabel: "3:24",
    recommendedFor: ["p1"],
  },
  {
    id: "edu-2",
    title: "Understanding Your Blood Pressure Numbers",
    thumbnailUrl: "/education/bp-basics.jpg",
    durationLabel: "4:10",
    recommendedFor: ["p2"],
  },
  {
    id: "edu-3",
    title: "Living Well with Type 2 Diabetes",
    thumbnailUrl: "/education/diabetes-basics.jpg",
    durationLabel: "5:47",
    recommendedFor: ["p1"],
  },
  {
    id: "edu-4",
    title: "Talking to Your Care Team",
    thumbnailUrl: "/education/care-team.jpg",
    durationLabel: "2:58",
    recommendedFor: [],
  },
];

// ─────────────────────────────────────────────────────────────────
// Certificate
// ─────────────────────────────────────────────────────────────────

export const johnCertificate: AdherenceCertificate = {
  patientId: "p1",
  patientName: "John Doe",
  streakDays: 7,
  issuedAt: isoDaysAgo(0, 6, 0),
  qrCodeData: "https://demo.carebridgerx.app/cert/p1",
};

// ─────────────────────────────────────────────────────────────────
// Sync State — default, toggled live by ui-store.ts during the demo
// ─────────────────────────────────────────────────────────────────

export const defaultSyncState: SyncState = {
  status: "online",
  lastSyncedAt: isoDaysAgo(0, 6, 0),
};
