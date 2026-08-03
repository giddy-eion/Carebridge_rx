import Link from "next/link";
import { Stethoscope, HeartHandshake, Pill, Link2 } from "lucide-react";

const ROLES = [
  {
    role: "clinician",
    title: "Clinician",
    description: "Access the clinical dashboard & population health tools.",
    icon: Stethoscope,
    tone: "text-brand-500 bg-brand-50",
  },
  {
    role: "caregiver",
    title: "Caregiver",
    description: "Monitor your loved one's adherence & send support.",
    icon: HeartHandshake,
    tone: "text-chip-peach-icon bg-chip-peach-bg",
  },
  {
    role: "patient",
    title: "Patient",
    description: "Track your medications, vitals & learning.",
    icon: Pill,
    tone: "text-chip-mint-icon bg-chip-mint-bg",
  },
] as const;

export default function RoleSelectionPortal() {
  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 py-16">
      <div className="flex items-center gap-2 mb-3">
        <Link2 size={22} className="text-brand-500" aria-hidden="true" />
        <span className="font-display font-semibold text-xl text-foreground">CareBridge Rx</span>
      </div>
      <p className="text-sm text-foreground-muted mb-10 text-center max-w-xs">
        A digital safety net connecting patients, family, and clinical teams.
      </p>

      <div className="w-full max-w-sm flex flex-col gap-4">
        {ROLES.map(({ role, title, description, icon: Icon, tone }) => (
          <Link
            key={role}
            href={`/login/${role}`}
            className="bg-surface-raised rounded-2xl p-5 shadow-[0_4px_14px_rgba(16,22,43,0.06)] flex items-start gap-4 hover:shadow-[0_6px_20px_rgba(16,22,43,0.1)] transition-shadow"
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${tone}`}>
              <Icon size={20} strokeWidth={2} />
            </div>
            <div>
              <p className="font-display font-semibold text-foreground mb-0.5">{title}</p>
              <p className="text-xs text-foreground-muted leading-relaxed">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
