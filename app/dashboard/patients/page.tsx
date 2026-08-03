"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePatientsStore } from "@/stores/patients-store";
import { CardRow } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { triageStatusToBadgeTone } from "@/lib/utils/status-tone";
import { riskToTriageStatus } from "@/lib/utils/risk-engine";
import type { TriagePatientRow } from "@/types/clinician-view";

export default function PatientListPage() {
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
  return (
    <div className="px-4">
      <p className="text-xs text-foreground-muted mb-3">All patients &middot; {rows.length}</p>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <Link key={row.patientId} href={`/dashboard/patients/${row.patientId}`}>
            <CardRow className="flex items-center gap-3">
              <Avatar name={row.patientName} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{row.patientName}</p>
                <p className="text-[11px] text-foreground-muted">{row.missedDoseCount} missed this week</p>
              </div>
              <Badge tone={triageStatusToBadgeTone(row.riskStatus)}>{row.adherencePercent}%</Badge>
            </CardRow>
          </Link>
        ))}
      </div>
    </div>
  );
}
