"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pill, CloudUpload, Globe, Bell, Moon, LogOut, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { usePatientsStore } from "@/stores/patients-store";
import { resolvePatientId } from "@/lib/constants/account-patient-map";
import { patientClinicalProfiles } from "@/lib/mock/fixtures";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { IconChip } from "@/components/ui/icon-chip";
import { Switch } from "@/components/ui/switch";
import type { PatientAccount } from "@/types/domain";
import { format } from "date-fns";

export default function PatientProfilePage() {
  const router = useRouter();
  const account = useAuthStore((s) => s.currentAccount) as PatientAccount | null;
  const logout = useAuthStore((s) => s.logout);
  const patientId = account ? resolvePatientId(account.id) : undefined;
  const patient = usePatientsStore((s) => (patientId ? s.patients[patientId] : undefined));
  const profile = patientClinicalProfiles.find((p) => p.patientId === patientId);

  // Local-only demo state — seeded from the account, not persisted to the store.
  const [discreetMode, setDiscreetMode] = useState(account?.appPreferences.discreetMode ?? false);
  const [offlineSync, setOfflineSync] = useState(account?.appPreferences.offlineSyncEnabled ?? false);
  const [notificationSounds, setNotificationSounds] = useState(account?.appPreferences.notificationSounds ?? true);
  const [darkMode, setDarkMode] = useState(false);

  if (!account || !patient) return null;

  return (
    <div className="px-4">
      <Card className="flex items-center gap-3 mb-4">
        <Avatar name={account.name} size="lg" />
        <div>
          <p className="text-sm font-semibold text-foreground">{account.name}</p>
          {profile && (
            <p className="text-[11px] text-foreground-muted">
              DOB {format(new Date(profile.demographics.dateOfBirth), "MMM d, yyyy")}
            </p>
          )}
        </div>
      </Card>

      <p className="text-xs text-foreground-muted mb-2">App Preferences</p>
      <Card className="flex flex-col divide-y divide-border !p-0 mb-4">
        <SettingRow
          icon={Pill}
          tone="mint"
          label="Discreet Mode"
          description="Hide medication details. Show Dose A / B instead of names."
        >
          <Switch checked={discreetMode} onChange={setDiscreetMode} label="Discreet mode" />
        </SettingRow>
        <SettingRow
          icon={CloudUpload}
          tone="sky"
          label="Offline Sync"
          description="Save data locally and sync when you're back online."
        >
          <Switch checked={offlineSync} onChange={setOfflineSync} label="Offline sync" />
        </SettingRow>
        <SettingRow icon={Globe} tone="lavender" label="Language" description="English">
          <ChevronRight size={16} className="text-foreground-muted" />
        </SettingRow>
        <SettingRow
          icon={Bell}
          tone="peach"
          label="Notification Sounds"
          description="Play a sound for reminders and messages."
        >
          <Switch checked={notificationSounds} onChange={setNotificationSounds} label="Notification sounds" />
        </SettingRow>
        <SettingRow icon={Moon} tone="lavender" label="Dark Mode" description="Use a darker theme for low-light environments.">
          <Switch checked={darkMode} onChange={setDarkMode} label="Dark mode" />
        </SettingRow>
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

function SettingRow({
  icon,
  tone,
  label,
  description,
  children,
}: {
  icon: Parameters<typeof IconChip>[0]["icon"];
  tone: Parameters<typeof IconChip>[0]["tone"];
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <IconChip icon={icon} tone={tone} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground">{label}</p>
        <p className="text-[11px] text-foreground-muted leading-snug">{description}</p>
      </div>
      {children}
    </div>
  );
}
