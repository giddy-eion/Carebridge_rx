"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, Pill, CheckCircle2 } from "lucide-react";
import { usePatientsStore } from "@/stores/patients-store";
import { Card, CardRow } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { triageStatusToBadgeTone } from "@/lib/utils/status-tone";
import { riskToTriageStatus, computeTriageMetrics } from "@/lib/utils/risk-engine";
import type { TriagePatientRow } from "@/types/clinician-view";

export default function TriageDashboardPage() {
  const patients = usePatientsStore((s) => s.patients);

  const rows = useMemo((): TriagePatientRow[] =>
    Object.values(patients).map((p) => {
      const lastTaken = p.doseEvents
        .filter((e) => e.takenAt)
        .sort((a, b) => (a.takenAt! < b.takenAt! ? 1 : -1))[0];
      return {
        patientId: p.patientId,
        patientName: p.patientName,
        avatarUrl: p.avatarUrl,
        riskStatus: riskToTriageStatus(p.riskPercent),
        adherencePercent: p.adherencePercent,
        lastDoseAt: lastTaken?.takenAt,
        missedDoseCount: p.missedDoseCount,
      };
    }), [patients]);

  const metrics = useMemo(() =>
    computeTriageMetrics(
      Object.values(patients).map((p) => ({ riskPercent: p.riskPercent })),
      Object.values(patients).map((p) => p.missedDoseCount)
    ), [patients]);

  const sorted = [...rows].sort((a, b) => {
    const order = { red: 0, amber: 1, green: 2 } as const;
    return order[a.riskStatus] - order[b.riskStatus];
  });

  return (
    <div className="px-4">
      <p className="text-xs text-foreground-muted mb-3">Triage Dashboard</p>

      <Card className="flex mb-4 !p-3">
        <MetricCell icon={AlertTriangle} tone="rose" value={metrics.highRiskCount} label="High risk" />
        <div className="w-px bg-border" />
        <MetricCell icon={Pill} tone="peach" value={metrics.missedDosesCount} label="Missed" />
        <div className="w-px bg-border" />
        <MetricCell icon={CheckCircle2} tone="mint" value={metrics.stableCount} label="Stable" />
      </Card>

      <p className="text-xs text-foreground-muted mb-2">Patients</p>
      <div className="flex flex-col gap-2">
        {sorted.map((row) => (
          <Link key={row.patientId} href={`/dashboard/patients/${row.patientId}`}>
            <CardRow className="flex items-center gap-3">
              <Avatar name={row.patientName} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{row.patientName}</p>
                <p className="text-[11px] text-foreground-muted">
                  {row.missedDoseCount > 0 ? `${row.missedDoseCount} missed this week` : "No missed doses"}
                </p>
              </div>
              <Badge tone={triageStatusToBadgeTone(row.riskStatus)}>{row.adherencePercent}%</Badge>
            </CardRow>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MetricCell({
  icon: Icon,
  tone,
  value,
  label,
}: {
  icon: typeof AlertTriangle;
  tone: "rose" | "peach" | "mint";
  value: number;
  label: string;
}) {
  const toneClasses = {
    rose: "bg-chip-rose-bg text-chip-rose-icon",
    peach: "bg-chip-peach-bg text-chip-peach-icon",
    mint: "bg-chip-mint-bg text-chip-mint-icon",
  }[tone];
  return (
    <div className="flex-1 flex flex-col items-center py-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${toneClasses}`}>
        <Icon size={15} />
      </div>
      <p className="text-lg font-semibold text-foreground leading-none">{value}</p>
      <p className="text-[10px] text-foreground-muted mt-1">{label}</p>
    </div>
  );
}
