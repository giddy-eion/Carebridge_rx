"use client";

import { Card } from "@/components/ui/card";

const STATS = [
  { label: "Total patients", value: "8" },
  { label: "Monthly active users", value: "342" },
  { label: "Avg adherence rate", value: "68%" },
  { label: "Subscription tier", value: "Enterprise" },
];

export default function HospitalDashboardPage() {
  return (
    <div className="px-4">
      <p className="text-xs text-foreground-muted mb-3">Hospital Dashboard</p>
      <div className="grid grid-cols-2 gap-3">
        {STATS.map((s) => (
          <Card key={s.label} className="!p-3">
            <p className="text-lg font-semibold text-foreground">{s.value}</p>
            <p className="text-[10px] text-foreground-muted mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
