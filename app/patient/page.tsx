"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Pill, Heart, Activity, Droplet, ClipboardList, BookOpen, Award, ArrowDown } from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "@/stores/auth-store";
import { usePatientsStore } from "@/stores/patients-store";
import { computeTodayDoseWindows } from "@/lib/utils/risk-engine";
import { resolvePatientId } from "@/lib/constants/account-patient-map";
import { Card } from "@/components/ui/card";
import { IconChip } from "@/components/ui/icon-chip";

export default function PatientHomePage() {
  const account = useAuthStore((s) => s.currentAccount);
  const patients = usePatientsStore((s) => s.patients);
  const logDose = usePatientsStore((s) => s.logDose);

  const patientId = account ? resolvePatientId(account.id) : undefined;
  const patient = patientId ? patients[patientId] : undefined;

  const todayWindows = useMemo(
    () => (patient ? computeTodayDoseWindows(patient.medications, patient.doseEvents) : []),
    [patient]
  );

  if (!account || !patient) return null;

  const actionable =
    todayWindows.find((w) => w.status === "due") ??
    todayWindows.find((w) => w.status === "missed") ??
    todayWindows.find((w) => w.status === "upcoming");

  const latestBP = patient.vitals
    .filter((v) => v.metric === "bloodPressure")
    .sort((a, b) => (a.recordedAt < b.recordedAt ? 1 : -1))[0];

  const latestHR = patient.vitals
    .filter((v) => v.metric === "heartRate")
    .sort((a, b) => (a.recordedAt < b.recordedAt ? 1 : -1))[0];

  function handleTakeNow() {
    if (!actionable) return;
    const today = new Date().toISOString().slice(0, 10);
    logDose(
      patient!.patientId,
      actionable.medicationId,
      `${today}T${actionable.scheduledTime}:00.000Z`,
      "patient_timer"
    );
    toast.success("Dose logged!", { icon: () => "💊" });
  }

  // Ring geometry
  const r = 54;
  const circ = 2 * Math.PI * r;
  const progress = actionable?.status === "taken" ? 100 : 65;
  const offset = circ * (1 - progress / 100);

  return (
    <div className="px-4 flex flex-col gap-3">
      {/* ── Dose Timer Card ── */}
      <Card className="flex flex-col items-center pt-6 pb-5">
        <div className="relative">
          <svg width="160" height="160" viewBox="0 0 160 160">
            {/* track */}
            <circle cx="80" cy="80" r={r} fill="none" stroke="#e5e7f0" strokeWidth="10" />
            {/* progress arc */}
            <circle
              cx="80"
              cy="80"
              r={r}
              fill="none"
              stroke="var(--color-brand-500)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              transform="rotate(-90 80 80)"
            />
          </svg>
          {/* pill icon + time centered inside ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            {/* gradient pill shape matching reference */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center shadow-md">
              <Pill size={20} className="text-white" />
            </div>
            <span className="text-[11px] text-foreground-muted font-medium mt-1">
              {actionable?.scheduledTime ?? "—"}
            </span>
          </div>
        </div>

        <p className="font-display font-semibold text-lg text-foreground mt-3 mb-4">
          {actionable ? `${actionable.medicationName}` : "All doses taken"}
        </p>

        {actionable && actionable.status !== "taken" ? (
          <button
            onClick={handleTakeNow}
            className="w-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white rounded-2xl py-3.5 text-sm font-semibold transition-colors"
          >
            Take now
          </button>
        ) : (
          <div className="w-full bg-success-50 text-success-600 rounded-2xl py-3.5 text-sm font-semibold text-center">
            ✓ All doses taken today
          </div>
        )}

        {/* ── Vitals row ── */}
        <div className="w-full flex items-stretch mt-5 divide-x divide-border">
          <StatCell
            icon={Heart}
            tone="rose"
            label="Heart"
            value={latestHR ? `${latestHR.value} BPM` : "76 BPM"}
          />
          <StatCell
            icon={Activity}
            tone="mint"
            label="Activity Pulse"
            value={latestBP?.value ?? "132/86"}
            sub={<ArrowDown size={10} className="text-brand-500 inline" />}
          />
          <StatCell
            icon={Droplet}
            tone="sky"
            label="BP Trend"
            value="Improved"
            sub={<ArrowDown size={10} className="text-brand-500 inline" />}
            valueClass="text-brand-500"
          />
        </div>
      </Card>

      {/* ── Adherence Banner ── */}
      <div className="bg-brand-50 rounded-2xl px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
          <Activity size={15} className="text-brand-500" />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-brand-700">Adherence Trending Up</p>
          <p className="text-[11px] text-brand-600">Great job! You&apos;re building consistency.</p>
        </div>
        <div className="bg-white rounded-xl px-3 py-1.5 text-center shadow-sm flex-shrink-0">
          <p className="text-lg font-bold text-brand-600">{patient.adherencePercent}%</p>
          <p className="text-[9px] text-foreground-muted">7-day adherence</p>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-3 gap-3">
        <QuickAction href="/patient/vitals" icon={ClipboardList} label="Vitals" tone="sky" />
        <QuickAction href="/patient/education" icon={BookOpen} label="Education" tone="lavender" />
        <QuickAction href="/patient/certificate" icon={Award} label="Certificate" tone="peach" />
      </div>
    </div>
  );
}

function StatCell({
  icon: Icon,
  tone,
  label,
  value,
  sub,
  valueClass,
}: {
  icon: typeof Heart;
  tone: "rose" | "mint" | "sky";
  label: string;
  value: string;
  sub?: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1.5 py-1">
      <IconChip icon={Icon} tone={tone} size="md" />
      <p className="text-[9px] text-foreground-muted text-center leading-none">{label}</p>
      <p className={`text-[13px] font-bold text-foreground leading-none ${valueClass ?? ""}`}>
        {value} {sub}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  tone,
}: {
  href: string;
  icon: typeof ClipboardList;
  label: string;
  tone: "sky" | "lavender" | "peach";
}) {
  return (
    <Link
      href={href}
      className="bg-surface-raised rounded-2xl p-4 flex flex-col items-center gap-2 shadow-[0_2px_10px_rgba(16,22,43,0.06)]"
    >
      <IconChip icon={Icon} tone={tone} size="lg" />
      <span className="text-[11px] text-foreground-muted font-medium">{label}</span>
    </Link>
  );
}
