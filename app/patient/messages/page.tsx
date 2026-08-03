"use client";

import { useAuthStore } from "@/stores/auth-store";
import { MessagesScreen } from "@/components/layout/messages-screen";

export default function PatientMessagesPage() {
  const account = useAuthStore((s) => s.currentAccount);
  if (!account) return null;
  return <MessagesScreen currentUserId={account.id} />;
}
