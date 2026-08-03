"use client";

import { useMemo, useState } from "react";
import { Pill, Info, Bell, Sun, Moon, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { usePatientsStore } from "@/stores/patients-store";
import { resolvePatientId } from "@/lib/constants/account-patient-map";
import { computeAdherenceHistory } from "@/lib/utils/risk-engine";
import { Card } from "@/components/ui/card";
import { IconChip } from "@/components/ui/icon-chip";
import { format } from "date-fns";

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

export default function PatientMedicationsPage() {
  const account = useAuthStore((s) => s.currentAccount);
  const patientId = account ? resolvePatientId(account.id) : undefined;
  const patient = usePatientsStore((s) => (patientId ? s.patients[patientId] : undefined));
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const history = useMemo(
    () => (patient ? computeAdherenceHistory(patient.medications, patient.doseEvents) : []),
    [patient]
  );

  if (!patient) return null;

  const takenTotal = history.flatMap((h) => h.last7Days).filter((d) => d.taken).length;
  const totalDoses = history.flatMap((h) => h.last7Days).length;

  return (
    <div className="px-4 flex flex-col gap-3">
      {/* ── Adherence Score Header ── */}
      <Card className="flex items-center gap-4">
        {/* Circular progress */}
        <div className="relative flex-shrink-0">
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="28" fill="none" stroke="#e5e7f0" strokeWidth="6" />
            <circle
              cx="36"
              cy="36"
              r="28"
              fill="none"
              stroke="var(--color-brand-500)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 28}
              strokeDashoffset={2 * Math.PI * 28 * (1 - patient.adherencePercent / 100)}
              transform="rotate(-90 36 36)"
            />
            <text
              x="36"
              y="40"
              textAnchor="middle"
              fontSize="14"
              fontWeight="700"
              fill="var(--color-foreground)"
            >
              {patient.adherencePercent}%
            </text>
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-0.5">
            <p className="text-[13px] font-semibold text-foreground">Adherence Score</p>
            <Info size={11} className="text-foreground-muted" />
          </div>
          <p className="text-[11px] text-foreground-muted">Great job! You&apos;re building consistency.</p>
        </div>
        <button className="flex items-center gap-1 border border-border rounded-xl px-2.5 py-1.5 text-[11px] text-foreground-muted flex-shrink-0">
          View Insights
        </button>
      </Card>

      {/* ── Tip Banner ── */}
      <div className="bg-brand-50 rounded-2xl px-4 py-3 flex items-center gap-3 border-l-4 border-brand-500">
        <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
          <Pill size={13} className="text-brand-500" />
        </div>
        <div>
          <p className="text-[12px] font-semibold text-brand-700">Consistency is key to your health.</p>
          <p className="text-[11px] text-brand-600">Keep taking your medications as prescribed.</p>
        </div>
      </div>

      {/* ── Medication Cards ── */}
      {patient.medications.map((med) => {
        const entry = history.find((h) => h.medicationId === med.id);
        const takenCount = entry?.last7Days.filter((d) => d.taken).length ?? 0;
        const weekPct = Math.round((takenCount / 7) * 100);
        const expanded = expandedId === med.id;
        const missedCount = 7 - takenCount;

        return (
          <Card key={med.id} className="!p-0">
            {/* Header row */}
            <button
              className="w-full flex items-center gap-3 px-4 pt-4 pb-3 text-left"
              onClick={() => setExpandedId(expanded ? null : med.id)}
            >
              <div className="w-10 h-10 rounded-full bg-chip-mint-bg flex items-center justify-center flex-shrink-0">
                <Pill size={18} className="text-chip-mint-icon" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-bold text-foreground">{med.name}</p>
                  <span className="bg-brand-50 text-brand-600 text-[10px] font-semibold rounded-full px-2 py-0.5">
                    {med.dosage}
                  </span>
                  <span className="bg-surface-sunken text-foreground-muted text-[10px] rounded-full px-2 py-0.5">
                    {med.form}
                  </span>
                </div>
              </div>
              <span className="text-[18px]">{expanded ? "▲" : "▼"}</span>
            </button>

            {expanded && (
              <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border pt-3">
                {/* Schedule */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock size={12} className="text-foreground-muted" />
                    <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wide">Schedule</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {med.scheduleTimes.map((time, i) => (
                      <div key={time} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                        <div className="flex items-center gap-1.5">
                          {i === 0 ? (
                            <Sun size={13} className="text-brand-500" />
                          ) : (
                            <Moon size={13} className="text-brand-500" />
                          )}
                          <span className="text-[13px] font-semibold text-brand-500">{time}</span>
                        </div>
                        <span className="text-[11px] text-foreground-muted">
                          1 {med.form} · {i === 0 ? "Morning" : "Evening"} dose
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7-day adherence grid */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wide">
                        Adherence (Last 7 Days)
                      </p>
                    </div>
                    <div className="flex gap-2 text-[9px] text-foreground-muted">
                      <span className="flex items-center gap-0.5">
                        <span className="w-2 h-2 rounded-full bg-success-500 inline-block" /> Taken
                      </span>
                      <span className="flex items-center gap-0.5">
                        <span className="w-2 h-2 rounded-full bg-danger-500 inline-block" /> Missed
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between mb-2">
                    {entry?.last7Days.map((d, i) => (
                      <div key={d.date} className="flex flex-col items-center gap-1">
                        <span className="text-[9px] text-foreground-muted font-medium">
                          {DAY_LETTERS[i]}
                        </span>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            d.taken ? "bg-success-50" : "bg-danger-50"
                          }`}
                        >
                          {d.taken ? (
                            <Pill size={14} className="text-success-500" />
                          ) : (
                            <XCircle size={14} className="text-danger-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Summary row */}
                  <div className="flex items-center justify-between bg-surface-sunken rounded-xl px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-success-500" />
                      <span className="text-[11px] text-foreground-muted">
                        {takenCount} / 7 doses taken
                      </span>
                    </div>
                    <span className="text-[12px] font-bold text-brand-500">{weekPct}% this week</span>
                  </div>
                  {/* Missed warning */}
                  {missedCount > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Info size={11} className="text-warning-500" />
                      <span className="text-[10px] text-warning-600">
                        Evening doses missed this week: {missedCount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Refill info */}
                <p className="text-[10px] text-foreground-muted">
                  Next refill {format(new Date(med.nextRefillDate), "MMM d, yyyy")}
                </p>
              </div>
            )}

            {/* Collapsed summary when closed */}
            {!expanded && entry && (
              <div className="px-4 pb-3 flex items-center justify-between">
                <div className="flex gap-3 text-[11px] text-foreground-muted">
                  {med.scheduleTimes.map((t, i) => (
                    <span key={t} className="flex items-center gap-1">
                      {i === 0 ? <Sun size={11} /> : <Moon size={11} />}
                      <span className="text-brand-500 font-semibold">{t}</span>
                      <span>1 tablet</span>
                    </span>
                  ))}
                </div>
                <span className="text-[12px] font-bold text-brand-500">{weekPct}% this week</span>
              </div>
            )}
          </Card>
        );
      })}

      {/* ── Reminder CTA ── */}
      <div className="flex items-center justify-between bg-surface-raised rounded-2xl p-3 shadow-[0_2px_8px_rgba(16,22,43,0.05)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-brand-300 flex items-center justify-center">
            <Bell size={15} className="text-brand-500" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-foreground">Having trouble keeping up?</p>
            <p className="text-[10px] text-foreground-muted">Set reminders or talk to your clinician.</p>
          </div>
        </div>
        <button className="bg-brand-500 text-white rounded-xl px-3 py-2 text-[11px] font-semibold flex items-center gap-1.5 flex-shrink-0">
          <Bell size={12} />
          Set Reminder
        </button>
      </div>
    </div>
  );
}
