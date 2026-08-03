// The only patient account that can actually log in during this demo is
// John Doe — see lib/mock/fixtures.ts for the "three live accounts" note.
export const PATIENT_ACCOUNT_TO_PATIENT_ID: Record<string, string> = {
  "u-patient-1": "p1",
};

export function resolvePatientId(accountId: string): string | undefined {
  return PATIENT_ACCOUNT_TO_PATIENT_ID[accountId];
}
