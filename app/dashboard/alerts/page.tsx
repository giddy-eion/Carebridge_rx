"use client";

import { AlertTriangle } from "lucide-react";
import { usePatientsStore } from "@/stores/patients-store";
import { CardRow } from "@/components/ui/card";
import { IconChip } from "@/components/ui/icon-chip";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const TONE_BY_SEVERITY = { critical: "rose", warning: "peach", info: "sky" } as const;

export default function ClinicianAlertsPage() {
  const alerts = usePatientsStore((s) => s.alerts);
  const acknowledgeAlert = usePatientsStore((s) => s.acknowledgeAlert);

  const myAlerts = alerts
    .filter((a) => a.targetRole === "clinician")
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

  return (
    <div className="px-4">
      <p className="text-xs text-foreground-muted mb-3">Alerts &middot; {myAlerts.filter((a) => a.status === "active").length} active</p>
      <div className="flex flex-col gap-2">
        {myAlerts.map((alert) => (
          <CardRow key={alert.id} className="flex gap-3 items-start">
            <IconChip icon={AlertTriangle} tone={TONE_BY_SEVERITY[alert.severity]} size="sm" />
            <div className="flex-1">
              <p className="text-[12px] text-foreground leading-snug">{alert.message}</p>
              <p className="text-[10px] text-foreground-muted mt-0.5">{format(new Date(alert.timestamp), "MMM d, h:mm a")}</p>
            </div>
            {alert.status === "active" ? (
              <Button size="sm" variant="secondary" onClick={() => acknowledgeAlert(alert.id)}>
                Ack
              </Button>
            ) : (
              <span className="text-[10px] text-foreground-muted capitalize">{alert.status}</span>
            )}
          </CardRow>
        ))}
      </div>
    </div>
  );
}
