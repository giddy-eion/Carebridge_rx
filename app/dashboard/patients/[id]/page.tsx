"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ShieldCheck, Thermometer, Frown, PersonStanding, Wind } from "lucide-react";
import { usePatientsStore } from "@/stores/patients-store";
import { Card, CardRow } from "@/components/ui/card";
import { IconChip } from "@/components/ui/icon-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { format } from "date-fns";

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const patient = usePatientsStore((s) => s.patients[id]);
  const markDoseTakenByClinician = usePatientsStore((s) => s.markDoseTakenByClinician);

  if (!patient) {
    return <p className="p-4 text-sm text-foreground-muted">Patient not found.</p>;
  }

  const last7Doses = [...patient.doseEvents]
    .sort((a, b) => (a.scheduledTime < b.scheduledTime ? 1 : -1))
    .slice(0, 7);

  const latestHtpar = [...patient.htparLog].sort((a, b) => (a.recordedAt < b.recordedAt ? 1 : -1))[0];

  function handleMarkTaken(doseEventId: string) {
    markDoseTakenByClinician(id, doseEventId);
    toast.success("Marked as taken — risk score updated");
  }

  const riskCircumference = 2 * Math.PI * 30;
  const riskOffset = riskCircumference * (1 - patient.riskPercent / 100);

  return (
    <div className="px-4">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-full bg-surface-raised shadow-[0_2px_6px_rgba(16,22,43,0.08)] flex items-center justify-center"
          aria-label="Back"
        >
          <ChevronLeft size={15} />
        </button>
        <div>
          <p className="text-sm font-semibold text-foreground">{patient.patientName}</p>
          <p className="text-[11px] text-foreground-muted">Adherence {patient.adherencePercent}%</p>
        </div>
      </div>

      <Card className="text-center mb-4">
        <p className="text-[11px] text-foreground-muted mb-1">AI Risk Prediction</p>
        <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto">
          <circle cx="40" cy="40" r="30" fill="none" stroke="var(--color-danger-50)" strokeWidth="8" />
          <circle
            cx="40"
            cy="40"
            r="30"
            fill="none"
            stroke="var(--color-danger-500)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={riskCircumference}
            strokeDashoffset={riskOffset}
            transform="rotate(-90 40 40)"
          />
          <text x="40" y="46" textAnchor="middle" fontSize="17" fontWeight="600" fill="var(--color-foreground)">
            {patient.riskPercent}%
          </text>
        </svg>
        <p className="text-[11px] text-foreground-muted mt-2">{patient.riskTagline}</p>
        {patient.riskOverrideNote && (
          <p className="text-[10px] text-brand-600 mt-1 italic">Override: {patient.riskOverrideNote}</p>
        )}
      </Card>

      {latestHtpar && (
        <>
          <p className="text-xs text-foreground-muted mb-2">
            HTPAR &middot; {format(new Date(latestHtpar.recordedAt), "MMM d")}
          </p>
          <Card className="flex justify-between mb-4">
            <HtparCell icon={ShieldCheck} tone="mint" label="Health" value={latestHtpar.health} />
            <HtparCell icon={Thermometer} tone="peach" label="Temp" value={latestHtpar.temperature} />
            <HtparCell icon={Frown} tone="lavender" label="Pain" value={latestHtpar.pain} />
            <HtparCell icon={PersonStanding} tone="sky" label="Activity" value={latestHtpar.activity} />
            <HtparCell icon={Wind} tone="mint" label="Resp" value={latestHtpar.respiration} />
          </Card>
        </>
      )}

      <p className="text-xs text-foreground-muted mb-2">Adherence log</p>
      <div className="flex flex-col gap-2 mb-4">
        {last7Doses.map((dose) => {
          const med = patient.medications.find((m) => m.id === dose.medicationId);
          const taken = !!dose.takenAt;
          return (
            <CardRow key={dose.id} className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-foreground">
                  {format(new Date(dose.scheduledTime), "EEE, h:mm a")} &middot; {med?.name}
                </p>
                {taken && dose.source === "clinician_override" && (
                  <p className="text-[10px] text-brand-600">DOT verified by clinician</p>
                )}
              </div>
              {taken ? (
                <Badge tone="success">Taken</Badge>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => handleMarkTaken(dose.id)}>
                  Mark as taken
                </Button>
              )}
            </CardRow>
          );
        })}
      </div>
    </div>
  );
}

function HtparCell({
  icon,
  tone,
  label,
  value,
}: {
  icon: Parameters<typeof IconChip>[0]["icon"];
  tone: Parameters<typeof IconChip>[0]["tone"];
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <IconChip icon={icon} tone={tone} size="sm" />
      <p className="text-[9px] text-foreground-muted">{label}</p>
      <p className="text-[11px] font-semibold text-foreground">{value}/5</p>
    </div>
  );
}
