"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { usePatientsStore } from "@/stores/patients-store";
import { johnCareTeam } from "@/lib/mock/fixtures";
import { CardRow } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import type { CaregiverAccount } from "@/types/domain";

export default function CaregiverCirclePage() {
  const account = useAuthStore((s) => s.currentAccount) as CaregiverAccount | null;
  const conversations = usePatientsStore((s) => s.conversations);

  if (!account) return null;

  // Only John Doe (p1) has a fully seeded care circle in this demo.
  const assignedPatientId = account.assignedPatientIds[0];
  const circle = assignedPatientId === "p1" ? johnCareTeam : [];

  return (
    <div className="px-4">
      <p className="text-xs text-foreground-muted mb-3">Care team</p>
      <div className="flex flex-col gap-2">
        {circle.map((member) => {
          const conversation = conversations.find(
            (c) => c.participantIds.includes(account.id) && c.participantIds.includes(member.userId)
          );
          return (
            <CardRow key={member.userId} className="flex items-center gap-3">
              <div className="relative">
                <Avatar name={member.name} />
                <span
                  className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-surface-raised ${
                    member.onlineStatus === "online" ? "bg-success-500" : "bg-foreground-muted/40"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{member.name}</p>
                <p className="text-[11px] text-foreground-muted capitalize">{member.role}</p>
              </div>
              {conversation && (
                <Link
                  href="/caregiver/messages"
                  className="w-8 h-8 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center flex-shrink-0"
                  aria-label={`Message ${member.name}`}
                >
                  <MessageCircle size={15} />
                </Link>
              )}
            </CardRow>
          );
        })}
        {circle.length === 0 && <p className="text-xs text-foreground-muted text-center py-8">No care team on file.</p>}
      </div>
    </div>
  );
}
