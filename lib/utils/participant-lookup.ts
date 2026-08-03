import { johnDoeAccount, lindaDoeAccount, drSarahChenAccount, nurseJane } from "@/lib/mock/fixtures";

export interface ParticipantInfo {
  id: string;
  name: string;
}

const DIRECTORY: Record<string, ParticipantInfo> = {
  [johnDoeAccount.id]: { id: johnDoeAccount.id, name: johnDoeAccount.name },
  [lindaDoeAccount.id]: { id: lindaDoeAccount.id, name: lindaDoeAccount.name },
  [drSarahChenAccount.id]: { id: drSarahChenAccount.id, name: drSarahChenAccount.name },
  [nurseJane.userId]: { id: nurseJane.userId, name: nurseJane.name },
};

export function lookupParticipant(userId: string): ParticipantInfo {
  return DIRECTORY[userId] ?? { id: userId, name: "Unknown" };
}

export function otherParticipantId(participantIds: [string, string], selfId: string): string {
  return participantIds[0] === selfId ? participantIds[1] : participantIds[0];
}
