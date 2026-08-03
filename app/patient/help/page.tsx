"use client";

import { HelpCircle } from "lucide-react";
import { CardRow } from "@/components/ui/card";
import { IconChip } from "@/components/ui/icon-chip";

const FAQS = [
  { q: "How do I log a dose?", a: "Tap \"Take now\" on the Home screen when a dose is due." },
  { q: "What happens if I miss a dose?", a: "Your care team is notified and your adherence score updates automatically." },
  { q: "Can my caregiver see my messages?", a: "Only messages you send directly to them — not your clinician conversations." },
  { q: "How is my risk score calculated?", a: "It's based on your recent dose-taking pattern, weighted toward the last few days." },
];

export default function PatientHelpPage() {
  return (
    <div className="px-4">
      <p className="text-xs text-foreground-muted mb-3">Frequently asked questions</p>
      <div className="flex flex-col gap-2">
        {FAQS.map((item) => (
          <CardRow key={item.q} className="flex gap-3 items-start">
            <IconChip icon={HelpCircle} tone="sky" size="sm" />
            <div>
              <p className="text-[12px] font-semibold text-foreground">{item.q}</p>
              <p className="text-[11px] text-foreground-muted mt-0.5 leading-relaxed">{item.a}</p>
            </div>
          </CardRow>
        ))}
      </div>
    </div>
  );
}
