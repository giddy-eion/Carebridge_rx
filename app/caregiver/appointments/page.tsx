"use client";

import { Calendar } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { usePatientsStore } from "@/stores/patients-store";
import { CardRow } from "@/components/ui/card";
import { IconChip } from "@/components/ui/icon-chip";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { CaregiverAccount } from "@/types/domain";

export default function CaregiverAppointmentsPage() {
  const account = useAuthStore((s) => s.currentAccount) as CaregiverAccount | null;
  const appointments = usePatientsStore((s) => s.appointments);

  if (!account) return null;

  const assignedPatientId = account.assignedPatientIds[0];
  const mine = appointments
    .filter((a) => a.patientId === assignedPatientId)
    .sort((a, b) => (a.scheduledFor < b.scheduledFor ? -1 : 1));
  const upcoming = mine.filter((a) => a.status === "upcoming");
  const past = mine.filter((a) => a.status !== "upcoming");

  return (
    <div className="px-4">
      <p className="text-xs text-foreground-muted mb-2">Upcoming</p>
      <div className="flex flex-col gap-2 mb-4">
        {upcoming.map((a) => (
          <CardRow key={a.id} className="flex gap-3">
            <IconChip icon={Calendar} tone="lavender" size="sm" />
            <div className="flex-1">
              <p className="text-[12px] font-medium text-foreground">{a.title}</p>
              <p className="text-[10px] text-foreground-muted mt-0.5">
                {format(new Date(a.scheduledFor), "EEE, MMM d")} &middot; {format(new Date(a.scheduledFor), "h:mm a")}
              </p>
              {a.location && <p className="text-[10px] text-foreground-muted">{a.location}</p>}
            </div>
          </CardRow>
        ))}
        {upcoming.length === 0 && <p className="text-xs text-foreground-muted">No upcoming appointments.</p>}
      </div>

      {past.length > 0 && (
        <>
          <p className="text-xs text-foreground-muted mb-2">Past</p>
          <div className="flex flex-col gap-2">
            {past.map((a) => (
              <CardRow key={a.id} className="flex gap-3 items-center">
                <IconChip icon={Calendar} tone="sky" size="sm" />
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-foreground">{a.title}</p>
                  <p className="text-[10px] text-foreground-muted mt-0.5">
                    {format(new Date(a.scheduledFor), "MMM d, yyyy")}
                  </p>
                </div>
                <Badge tone={a.status === "completed" ? "success" : "neutral"} className="capitalize">
                  {a.status}
                </Badge>
              </CardRow>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
