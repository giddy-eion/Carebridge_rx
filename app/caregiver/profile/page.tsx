"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut, ChevronRight, HeartHandshake } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { usePatientsStore } from "@/stores/patients-store";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { IconChip } from "@/components/ui/icon-chip";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import type { CaregiverAccount } from "@/types/domain";

export default function CaregiverProfilePage() {
  const router = useRouter();
  const account = useAuthStore((s) => s.currentAccount) as CaregiverAccount | null;
  const logout = useAuthStore((s) => s.logout);
  const patients = usePatientsStore((s) => s.patients);

  const [notifyMissedDose, setNotifyMissedDose] = useState(account?.alertPreferences.notifyOnMissedDose ?? true);
  const [notifyVitalSpike, setNotifyVitalSpike] = useState(account?.alertPreferences.notifyOnVitalSpike ?? true);

  if (!account) return null;

  const assignedNames = account.assignedPatientIds.map((id) => patients[id]?.patientName ?? id);

  return (
    <div className="px-4">
      <Card className="flex items-center gap-3 mb-4">
        <Avatar name={account.name} size="lg" />
        <div>
          <p className="text-sm font-semibold text-foreground">{account.name}</p>
          <p className="text-[11px] text-foreground-muted">{account.relationshipToPatient} of {assignedNames.join(", ")}</p>
        </div>
      </Card>

      <p className="text-xs text-foreground-muted mb-2">Alert Preferences</p>
      <Card className="flex flex-col divide-y divide-border !p-0 mb-4">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <IconChip icon={Bell} tone="peach" size="sm" />
          <div className="flex-1">
            <p className="text-[13px] font-medium text-foreground">Missed Dose Alerts</p>
            <p className="text-[11px] text-foreground-muted">Notify me when a dose is missed.</p>
          </div>
          <Switch checked={notifyMissedDose} onChange={setNotifyMissedDose} label="Missed dose alerts" />
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <IconChip icon={HeartHandshake} tone="rose" size="sm" />
          <div className="flex-1">
            <p className="text-[13px] font-medium text-foreground">Vital Spike Alerts</p>
            <p className="text-[11px] text-foreground-muted">Notify me on abnormal vitals.</p>
          </div>
          <Switch checked={notifyVitalSpike} onChange={setNotifyVitalSpike} label="Vital spike alerts" />
        </div>
      </Card>

      <Card className="!p-0">
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        >
          <IconChip icon={LogOut} tone="rose" size="sm" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-danger-500">Logout</p>
            <p className="text-[11px] text-foreground-muted">Sign out of your account.</p>
          </div>
          <ChevronRight size={16} className="text-foreground-muted" />
        </button>
      </Card>
    </div>
  );
}
