"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { usePatientsStore } from "@/stores/patients-store";
import { AppHeader } from "@/components/layout/app-header";
import { NavDrawer } from "@/components/layout/nav-drawer";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function CaregiverLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentRole = useAuthStore((s) => s.currentRole);
  const account = useAuthStore((s) => s.currentAccount);
  const alerts = usePatientsStore((s) => s.alerts);

  useEffect(() => {
    if (currentRole !== "caregiver") router.replace("/");
  }, [currentRole, router]);

  if (currentRole !== "caregiver" || !account) return null;

  const activeAlertCount = alerts.filter((a) => a.targetRole === "caregiver" && a.status === "active").length;

  return (
    <div className="min-h-screen bg-surface flex flex-col max-w-md mx-auto">
      <AppHeader identityLabel={account.name} alertCount={activeAlertCount} />
      <NavDrawer role="caregiver" />
      <div className="flex-1 overflow-y-auto pb-2">{children}</div>
      <BottomNav role="caregiver" />
    </div>
  );
}
