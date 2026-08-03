"use client";

import { Menu, Bell, Pill } from "lucide-react";
import { useUiStore } from "@/stores/ui-store";

interface AppHeaderProps {
  identityLabel: string;
  alertCount?: number;
}

export function AppHeader({ identityLabel, alertCount = 0 }: AppHeaderProps) {
  const openDrawer = useUiStore((s) => s.openDrawer);

  return (
    <header className="flex items-center justify-between px-4 pt-4 pb-2">
      {/* Left: hamburger */}
      <button
        onClick={openDrawer}
        aria-label="Open navigation menu"
        className="w-9 h-9 flex items-center justify-center"
      >
        <Menu size={22} className="text-foreground" />
      </button>

      {/* Center: pill icon + wordmark */}
      <div className="flex items-center gap-1.5">
        <Pill size={18} className="text-brand-500" />
        <span className="font-display font-bold text-[17px] text-foreground tracking-tight">
          CareBridge Rx
        </span>
      </div>

      {/* Right: identity + bell */}
      <div className="flex items-center gap-2.5">
        <span className="text-[13px] text-foreground-muted font-medium">{identityLabel}</span>
        <div className="relative">
          <button aria-label={`Notifications${alertCount > 0 ? `, ${alertCount} unread` : ""}`}>
            <Bell size={20} className="text-foreground-muted" />
          </button>
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-danger-500 text-white text-[9px] font-bold flex items-center justify-center px-1">
              {alertCount}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
