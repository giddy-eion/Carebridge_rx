# CareBridge Rx — Handoff Package

This is the actual working project so far, not just the data model. Unzip
straight into a fresh Next.js 16 project root (paths already match the `@/*`
alias).

## Status: what's real and working

- **Full data layer** (`types/`, `lib/mock/fixtures.ts`, `lib/utils/risk-engine.ts`,
  `stores/patients-store.ts`) — type-checked clean, and `logDose()` has been
  verified end-to-end to move John Doe's adherence 42%→68% and drop the
  triage `highRiskCount` from 4→3 off one real store action.
- **Shell**: Role Selection Portal (`/`) → fake login (`/login/[role]`) →
  three route groups, `(dashboard)` (Clinician), `(patient)`, `(caregiver)`,
  each with header, hamburger drawer, and bottom nav (Message tab included
  on all three, as required).
- **Messaging**: fully functional, one shared `MessagesScreen` component
  reused by all three roles — real threads from the seeded Communication
  Matrix, working send box, mock auto-reply ~1.5s after sending
  (`lib/utils/mock-replies.ts`).
- **Clinician**: Triage Dashboard (live metrics + patient list), Patient
  Detail (AI Risk card, HTPAR, adherence log with "Mark as taken" override),
  Alerts (acknowledge), Refills (approve/deny), Appointments, Patient List,
  Hospital Dashboard (static), Profile.
- **Patient**: Home (real PIU Timer wired to `logDose`), Vitals (BP/Heart
  Rate toggle + HTPAR), Medications (7-day adherence pill row).
- **Caregiver**: Home (assigned patient status card, alerts, next
  appointment), Messages.

## Known gaps — not yet built (will 404 if linked to)

- Patient: Education, Certificate, Appointments, Profile, Help, Terms
- Caregiver: Alerts (dedicated page), Appointments, Circle, Profile

These are all straightforward — same patterns as the pages that already
exist (e.g. Patient Appointments ≈ same shape as Clinician Appointments;
Caregiver Alerts ≈ same shape as Clinician Alerts filtered to `targetRole:
'caregiver'`).

## Decisions already locked — don't re-ask these

- **Build order**: Clinician → Patient → Caregiver (Clinician is most complete)
- **Visual direction**: matches the reference screenshots exactly — teal
  brand (`#0E7C86`), lavender-gray background, rounded-2xl/3xl white cards,
  pastel icon chips (mint/sky/lavender/peach/rose) reserved for list rows
  and quick-actions only, not nav/header icons
- **Triage navigation**: full page nav to `/dashboard/patients/[id]`, not a
  slide-over
- **App name**: CareBridge Rx (not "Sentinel" — that was an earlier
  placeholder, already fully purged from the codebase)
- **Clinician identity**: Dr. Sarah Chen is both the login account and
  John's treating physician — one person, not two

## Demo flows — what each role's click-through needs to support

These are the scripted "wow" sequences the UI is built around. Screens
not yet built should still be designed with these steps in mind.

### Clinician (Dr. Sarah Chen) — most complete, built first
1. Login → land on Triage Dashboard, see the scale of the problem (risk metrics)
2. Click a high-risk patient → AI Risk Prediction + detailed clinical view
3. Log a clinical observation via HTPAR → watch the patient's timeline update
4. Switch to Alerts Feed → acknowledge a missed-dose alert
5. Go to Refills → approve a pending request
6. Open Appointments → send a reminder to a patient
7. Click "Export Report" → shows compliance readiness (not yet built — stub as a toast + fake 2s loading + dummy CSV download)
8. Navigate to Hospital Dashboard → aggregate, executive-level insights

### Patient (John Doe)
Login → see the PIU Timer and log a dose → watch the adherence chart update →
see the risk score implicitly drop (surfaced to the caregiver/clinician, not
directly shown to the patient) → chat with a caregiver → toggle Discreet
Mode (renames medications to "Dose A"/"Dose B" instantly, not yet built) →
toggle Offline Sync (simulated offline banner + reconnect spinner, not yet
built) → browse education videos (not yet built) → view the adherence
certificate (not yet built).

### Caregiver (Linda "Mom" Doe)
Login → see the simplified dashboard with assigned patient(s) → click into
a patient → view their vitals and risk summary → switch to Alerts → see
recent missed-dose notifications → click the chat bubble → send a message
and get a simulated reply → navigate to the Caregiver Circle → see the care
team and "invite" someone (toast stub, not yet built) → view appointments
and the patient's profile for completeness (not yet built).

## Not yet installed/run in this environment

`node_modules` and `.next` were intentionally excluded from this package.
Run `pnpm install` (or `npm install`) then `pnpm dev` to actually launch it.
