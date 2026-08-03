"use client";

import Link from "next/link";
import { type LucideIcon, X, LayoutGrid, Users, Bell, RefreshCcw, User, Pill, MessageCircle, Calendar, GraduationCap, Award, Activity, Building2, HelpCircle, FileText, LogOut } from "lucide-react";
import type { Role } from "@/types/domain";
import { useUiStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils/cn";

interface DrawerItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const DRAWER_BY_ROLE: Record<Role, DrawerItem[]> = {
  clinician: [
    { href: "/dashboard", label: "Triage Dashboard", icon: LayoutGrid },
    { href: "/dashboard/patients", label: "Patient List", icon: Users },
    { href: "/dashboard/alerts", label: "Alerts Feed", icon: Bell },
    { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
    { href: "/dashboard/refills", label: "Refill Requests", icon: RefreshCcw },
    { href: "/dashboard/appointments", label: "Appointments", icon: Calendar },
    { href: "/dashboard/hospital", label: "Hospital Dashboard", icon: Building2 },
    { href: "/dashboard/profile", label: "My Profile", icon: User },
  ],
  hospital_admin: [
    { href: "/dashboard", label: "Triage Dashboard", icon: LayoutGrid },
    { href: "/dashboard/hospital", label: "Hospital Dashboard", icon: Building2 },
  ],
  patient: [
    { href: "/patient", label: "Home", icon: LayoutGrid },
    { href: "/patient/vitals", label: "Vitals Chart", icon: Activity },
    { href: "/patient/medications", label: "My Medications", icon: Pill },
    { href: "/patient/messages", label: "Messages", icon: MessageCircle },
    { href: "/patient/education", label: "Education", icon: GraduationCap },
    { href: "/patient/certificate", label: "Adherence Certificate", icon: Award },
    { href: "/patient/appointments", label: "Appointments", icon: Calendar },
    { href: "/patient/profile", label: "My Profile", icon: User },
    { href: "/patient/help", label: "Help & FAQ", icon: HelpCircle },
    { href: "/patient/terms", label: "Terms & Privacy", icon: FileText },
  ],
  caregiver: [
    { href: "/caregiver", label: "Home", icon: LayoutGrid },
    { href: "/caregiver/alerts", label: "Alerts", icon: Bell },
    { href: "/caregiver/messages", label: "Messages", icon: MessageCircle },
    { href: "/caregiver/circle", label: "Caregiver Circle", icon: Users },
    { href: "/caregiver/appointments", label: "Appointments", icon: Calendar },
    { href: "/caregiver/profile", label: "My Account", icon: User },
  ],
};

export function NavDrawer({ role }: { role: Role }) {
  const isOpen = useUiStore((s) => s.isDrawerOpen);
  const closeDrawer = useUiStore((s) => s.closeDrawer);
  const logout = useAuthStore((s) => s.logout);
  const items = DRAWER_BY_ROLE[role];

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-foreground/30 z-40 transition-opacity",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={closeDrawer}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 w-72 max-w-[80%] bg-surface-raised z-50 shadow-[4px_0_20px_rgba(16,22,43,0.12)] transition-transform flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between p-4">
          <span className="font-display font-semibold text-foreground">CareBridge Rx</span>
          <button
            onClick={closeDrawer}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-sunken"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeDrawer}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-surface-sunken"
              >
                <Icon size={17} className="text-foreground-muted" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-border">
          <Link
            href="/"
            onClick={() => {
              logout();
              closeDrawer();
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-danger-500 hover:bg-danger-50"
          >
            <LogOut size={17} />
            Log out
          </Link>
        </div>
      </aside>
    </>
  );
}
