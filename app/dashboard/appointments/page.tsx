"use client";

import { Calendar } from "lucide-react";
import { usePatientsStore } from "@/stores/patients-store";
import { CardRow } from "@/components/ui/card";
import { IconChip } from "@/components/ui/icon-chip";
import { format } from "date-fns";

export default function ClinicianAppointmentsPage() {
  const appointments = usePatientsStore((s) => s.appointments);
  const patients = usePatientsStore((s) => s.patients);
  const upcoming = appointments.filter((a) => a.status === "upcoming");

  return (
    <div className="px-4">
      <p className="text-xs text-foreground-muted mb-3">Upcoming appointments</p>
      <div className="flex flex-col gap-2">
        {upcoming.map((a) => (
          <CardRow key={a.id} className="flex gap-3">
            <IconChip icon={Calendar} tone="lavender" size="sm" />
            <div>
              <p className="text-[12px] font-medium text-foreground">{a.title}</p>
              <p className="text-[10px] text-foreground-muted mt-0.5">
                {patients[a.patientId]?.patientName} &middot; {format(new Date(a.scheduledFor), "EEE, MMM d, h:mm a")}
              </p>
              {a.location && <p className="text-[10px] text-foreground-muted">{a.location}</p>}
            </div>
          </CardRow>
        ))}
      </div>
    </div>
  );
}
