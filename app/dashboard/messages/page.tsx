"use client";

import { useAuthStore } from "@/stores/auth-store";
import { MessagesScreen } from "@/components/layout/messages-screen";

export default function ClinicianMessagesPage() {
  const account = useAuthStore((s) => s.currentAccount);
  if (!account) return null;
  return <div className="flex flex-col h-full"><MessagesScreen currentUserId={account.id} /></div>;
}
