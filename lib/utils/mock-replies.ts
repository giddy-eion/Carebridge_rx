import { johnDoeAccount, lindaDoeAccount, drSarahChenAccount, nurseJane } from "@/lib/mock/fixtures";

const REPLIES_BY_SPEAKER: Record<string, string[]> = {
  [lindaDoeAccount.id]: [
    "On it! I'll call him now.",
    "Thanks for letting me know, checking in on him.",
    "Got it — I'll remind him tonight.",
  ],
  [johnDoeAccount.id]: [
    "Thanks Mom, I took it!",
    "Will do, feeling okay today.",
    "Got your message, thank you.",
  ],
  [drSarahChenAccount.id]: [
    "Thanks for the update — I'll review his chart.",
    "Noted, let's keep an eye on this over the next few days.",
    "Appreciate the flag, I'll follow up at his next visit.",
  ],
  [nurseJane.userId]: ["On it — will have that ready shortly.", "Confirmed, I'll take care of it."],
};

export function getMockReply(speakerId: string): string {
  const options = REPLIES_BY_SPEAKER[speakerId] ?? ["Got it, thank you!"];
  return options[Math.floor(Math.random() * options.length)];
}
