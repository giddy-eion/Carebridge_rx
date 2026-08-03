"use client";

import { AlertTriangle, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "@/stores/auth-store";
import { usePatientsStore } from "@/stores/patients-store";
import { Card, CardRow } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { IconChip } from "@/components/ui/icon-chip";
import { format } from "date-fns";
import type { CaregiverAccount } from "@/types/domain";

export default function CaregiverHomePage() {
  const account = useAuthStore((s) => s.currentAccount) as CaregiverAccount | null;
  const patients = usePatientsStore((s) => s.patients);
  const alerts = usePatientsStore((s) => s.alerts);
  const appointments = usePatientsStore((s) => s.appointments);

  if (!account) return null;

  const assignedPatientId = account.assignedPatientIds[0];
  const patient = patients[assignedPatientId];
  if (!patient) return null;

  const myAlerts = alerts
    .filter((a) => a.targetRole === "caregiver" && a.patientId === assignedPatientId && a.status === "active")
    .slice(0, 3);
  const upcomingAppt = appointments.find((a) => a.patientId === assignedPatientId && a.status === "upcoming");

  const statusDot = patient.missedDoseCount > 2 ? "bg-danger-500" : patient.missedDoseCount > 0 ? "bg-warning-500" : "bg-success-500";

  function handleSendReminder() {
    toast.info(`Reminder sent to ${patient.patientName}`);
  }

  return (
    <div className="px-4">
      <Card className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar name={patient.patientName} size="lg" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{patient.patientName}</p>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
              <span className="text-[11px] text-foreground-muted">
                {patient.missedDoseCount > 0 ? "Evening dose pending" : "All doses on track"}
              </span>
            </div>
          </div>
          <span className="text-sm font-semibold text-brand-500">{patient.adherencePercent}%</span>
        </div>
        <button
          onClick={handleSendReminder}
          className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-2.5 text-sm font-semibold w-full transition-colors"
        >
          Send reminder
        </button>
      </Card>

      <p className="text-xs text-foreground-muted mb-2">Alerts</p>
      <div className="flex flex-col gap-2 mb-4">
        {myAlerts.map((alert) => (
          <CardRow key={alert.id} className="flex gap-3">
            <IconChip icon={AlertTriangle} tone="rose" size="sm" />
            <div>
              <p className="text-[12px] text-foreground leading-snug">{alert.message}</p>
              <p className="text-[10px] text-foreground-muted mt-0.5">
                {format(new Date(alert.timestamp), "h:mm a")}
              </p>
            </div>
          </CardRow>
        ))}
        {myAlerts.length === 0 && <p className="text-xs text-foreground-muted">No active alerts.</p>}
      </div>

      {upcomingAppt && (
        <>
          <p className="text-xs text-foreground-muted mb-2">Upcoming</p>
          <CardRow className="flex gap-3">
            <IconChip icon={Calendar} tone="lavender" size="sm" />
            <div>
              <p className="text-[12px] text-foreground font-medium">{upcomingAppt.title}</p>
              <p className="text-[10px] text-foreground-muted mt-0.5">
                {format(new Date(upcomingAppt.scheduledFor), "EEE, h:mm a")}
              </p>
            </div>
          </CardRow>
        </>
      )}
    </div>
  );
}
