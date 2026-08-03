"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type LucideIcon,
  Home,
  ClipboardList,
  Users,
  Bell,
  RefreshCcw,
  User,
  Pill,
  MessageCircle,
  BookOpen,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Role } from "@/types/domain";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  clinician: [
    { href: "/dashboard", label: "Triage", icon: LayoutGrid },
    { href: "/dashboard/patients", label: "Patients", icon: Users },
    { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
    { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
    { href: "/dashboard/refills", label: "Refills", icon: RefreshCcw },
  ],
  hospital_admin: [
    { href: "/dashboard", label: "Triage", icon: LayoutGrid },
    { href: "/dashboard/patients", label: "Patients", icon: Users },
    { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
    { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
    { href: "/dashboard/refills", label: "Refills", icon: RefreshCcw },
  ],
  patient: [
    { href: "/patient", label: "Home", icon: Home },
    { href: "/patient/vitals", label: "Vitals", icon: ClipboardList },
    { href: "/patient/medications", label: "Medications", icon: Pill },
    { href: "/patient/messages", label: "Messages", icon: MessageCircle },
    { href: "/patient/profile", label: "User", icon: User },
  ],
  caregiver: [
    { href: "/caregiver", label: "Home", icon: Home },
    { href: "/caregiver/alerts", label: "Alerts", icon: Bell },
    { href: "/caregiver/messages", label: "Messages", icon: MessageCircle },
    { href: "/caregiver/appointments", label: "Visits", icon: ClipboardList },
    { href: "/caregiver/profile", label: "Profile", icon: User },
  ],
};

export function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV_BY_ROLE[role];

  return (
    <nav
      className="flex justify-around items-center pt-2 pb-4 bg-surface-raised border-t border-border sticky bottom-0"
      aria-label="Primary navigation"
    >
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== `/${role === "patient" ? "patient" : role === "caregiver" ? "caregiver" : "dashboard"}` && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-2 relative"
            aria-current={active ? "page" : undefined}
          >
            {/* Active underline indicator */}
            {active && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-brand-500" />
            )}
            <Icon
              size={22}
              strokeWidth={active ? 2.5 : 1.8}
              className={cn(active ? "text-brand-500" : "text-foreground-muted")}
            />
            <span
              className={cn(
                "text-[10px]",
                active ? "text-brand-500 font-semibold" : "text-foreground-muted font-normal"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
