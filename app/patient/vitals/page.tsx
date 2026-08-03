"use client";

import { useState } from "react";
import { ShieldCheck, Thermometer, Frown, PersonStanding, Wind, Droplet, Heart, Info } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { usePatientsStore } from "@/stores/patients-store";
import { resolvePatientId } from "@/lib/constants/account-patient-map";
import { Card } from "@/components/ui/card";
import { IconChip } from "@/components/ui/icon-chip";
import { format } from "date-fns";
import type { VitalMetric } from "@/types/domain";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function PatientVitalsPage() {
  const account = useAuthStore((s) => s.currentAccount);
  const patientId = account ? resolvePatientId(account.id) : undefined;
  const patient = usePatientsStore((s) => (patientId ? s.patients[patientId] : undefined));
  const [metric, setMetric] = useState<VitalMetric>("bloodPressure");

  if (!patient) return null;

  const readings = patient.vitals
    .filter((v) => v.metric === metric)
    .sort((a, b) => (a.recordedAt < b.recordedAt ? -1 : 1))
    .slice(-7);

  const latest = readings[readings.length - 1];
  const latestHtpar = [...patient.htparLog].sort((a, b) => (a.recordedAt < b.recordedAt ? 1 : -1))[0];

  const isBP = metric === "bloodPressure";

  // Chart bounds
  const chartW = 280;
  const chartH = 120;
  const pad = { top: 16, bottom: 20, left: 0, right: 0 };

  function numericSystolic(v: string) {
    return isBP ? Number(v.split("/")[0]) : Number(v);
  }
  function numericDiastolic(v: string) {
    return isBP ? Number(v.split("/")[1]) : null;
  }

  const sysValues = readings.map((r) => numericSystolic(r.value));
  const diaValues = isBP ? readings.map((r) => numericDiastolic(r.value) as number) : [];
  const allVals = [...sysValues, ...diaValues].filter(Boolean);
  const minVal = Math.min(...allVals) - 10;
  const maxVal = Math.max(...allVals) + 10;

  function toY(v: number) {
    return pad.top + ((maxVal - v) / (maxVal - minVal)) * (chartH - pad.top - pad.bottom);
  }
  function toX(i: number) {
    return readings.length <= 1 ? chartW / 2 : (i / (readings.length - 1)) * chartW;
  }

  const sysPoints = readings.map((r, i) => `${toX(i)},${toY(numericSystolic(r.value))}`).join(" ");
  const diaPoints = isBP
    ? readings.map((r, i) => `${toX(i)},${toY(numericDiastolic(r.value) as number)}`).join(" ")
    : "";

  return (
    <div className="px-4 flex flex-col gap-3">
      {/* Toggle */}
      <div className="flex bg-surface-raised rounded-full p-1 shadow-[0_2px_8px_rgba(16,22,43,0.06)]">
        {(["bloodPressure", "heartRate"] as VitalMetric[]).map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`flex-1 text-[13px] font-semibold py-2.5 rounded-full transition-colors ${
              metric === m ? "bg-brand-500 text-white shadow-sm" : "text-foreground-muted"
            }`}
          >
            {m === "bloodPressure" ? "BP" : "Heart Rate"}
          </button>
        ))}
      </div>

      {/* Chart card */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <IconChip icon={isBP ? Droplet : Heart} tone={isBP ? "sky" : "rose"} size="md" />
            <div>
              <p className="text-[13px] font-semibold text-foreground">
                {isBP ? "Blood Pressure" : "Heart Rate"}
                <span className="text-foreground-muted font-normal ml-1">{isBP ? "(mmHg)" : "(BPM)"}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-surface-sunken rounded-full px-3 py-1">
            <span className="text-[11px] text-foreground-muted">Last 7 Days</span>
          </div>
        </div>

        {/* Legend for BP */}
        {isBP && (
          <div className="flex gap-4 mb-2">
            <LegendItem color="var(--color-brand-500)" label="Systolic (Top)" />
            <LegendItem color="var(--color-chip-sky-icon)" label="Diastolic (Bottom)" />
          </div>
        )}

        {/* SVG Chart */}
        <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((t, i) => (
            <line
              key={i}
              x1={0}
              y1={pad.top + t * (chartH - pad.top - pad.bottom)}
              x2={chartW}
              y2={pad.top + t * (chartH - pad.top - pad.bottom)}
              stroke="#e5e7f0"
              strokeWidth="1"
            />
          ))}

          {/* Area fill — systolic */}
          {readings.length > 1 && (
            <polyline
              points={sysPoints}
              fill="none"
              stroke="var(--color-brand-500)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Diastolic line */}
          {isBP && readings.length > 1 && (
            <polyline
              points={diaPoints}
              fill="none"
              stroke="var(--color-chip-sky-icon)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 2"
            />
          )}

          {/* Data points with labels */}
          {readings.map((r, i) => {
            const sv = numericSystolic(r.value);
            const dv = isBP ? numericDiastolic(r.value) : null;
            const x = toX(i);
            const sy = toY(sv);
            const isLast = i === readings.length - 1;
            return (
              <g key={i}>
                {/* Systolic dot */}
                <circle cx={x} cy={sy} r={isLast ? 5 : 3.5} fill="var(--color-brand-500)" />
                {isLast && <circle cx={x} cy={sy} r={9} fill="var(--color-brand-500)" opacity="0.15" />}
                {/* Systolic label */}
                <text
                  x={x}
                  y={sy - 9}
                  textAnchor="middle"
                  fontSize="9"
                  fill="var(--color-brand-500)"
                  fontWeight="600"
                >
                  {sv}
                </text>
                {/* Diastolic */}
                {isBP && dv && (
                  <>
                    <circle cx={x} cy={toY(dv)} r={isLast ? 5 : 3.5} fill="var(--color-chip-sky-icon)" />
                    <text
                      x={x}
                      y={toY(dv) - 9}
                      textAnchor="middle"
                      fontSize="9"
                      fill="var(--color-chip-sky-icon)"
                      fontWeight="600"
                    >
                      {dv}
                    </text>
                  </>
                )}
                {/* Day label */}
                <text
                  x={x}
                  y={chartH}
                  textAnchor="middle"
                  fontSize="9"
                  fill="var(--color-foreground-muted)"
                >
                  {DAYS[i % 7]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Today's reading + normal range */}
        {latest && (
          <div className="flex gap-2 mt-3">
            <div className="flex-1 bg-brand-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <IconChip icon={isBP ? Droplet : Heart} tone={isBP ? "sky" : "rose"} size="sm" />
              <div>
                <p className="text-[10px] text-brand-600 font-medium">{isBP ? "Today's BP" : "Today's Heart Rate"}</p>
                <p className="text-[16px] font-bold text-foreground leading-tight">
                  {latest.value}
                  <span className="text-[10px] font-normal text-foreground-muted ml-1">
                    {isBP ? "mmHg" : "BPM"}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex-1 bg-success-50 rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-success-600 font-semibold mb-0.5">Normal Range</p>
              {isBP ? (
                <>
                  <p className="text-[10px] text-foreground-muted">Systolic: 90 – 120</p>
                  <p className="text-[10px] text-foreground-muted">Diastolic: 60 – 80</p>
                </>
              ) : (
                <p className="text-[10px] text-foreground-muted">60 – 100 BPM</p>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Clinician Assessment */}
      {latestHtpar && (
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">👩‍⚕️</span>
            <p className="text-[13px] font-semibold text-foreground">Clinician Assessments</p>
          </div>
          <p className="text-[11px] text-foreground-muted mb-3">
            Shows the most recent <span className="font-semibold text-foreground">HTPAR</span> log from Dr. Sarah.
          </p>
          <div className="flex items-center gap-2 bg-surface-sunken rounded-full px-3 py-1.5 w-fit mb-4">
            <Info size={11} className="text-foreground-muted" />
            <span className="text-[11px] text-foreground-muted">
              {format(new Date(latestHtpar.recordedAt), "MMM d")} – Dr. Sarah
            </span>
          </div>
          <div className="flex justify-between">
            <HtparCell icon={ShieldCheck} tone="mint" label="Health" value={latestHtpar.health} />
            <HtparCell icon={Thermometer} tone="peach" label="Temp" value={latestHtpar.temperature} />
            <HtparCell icon={Frown} tone="lavender" label="Pain" value={latestHtpar.pain} />
            <HtparCell icon={PersonStanding} tone="sky" label="Activity" value={latestHtpar.activity} />
            <HtparCell icon={Wind} tone="mint" label="Resp" value={latestHtpar.respiration} />
          </div>
        </Card>
      )}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] text-foreground-muted">{label}</span>
    </div>
  );
}

function HtparCell({
  icon,
  tone,
  label,
  value,
}: {
  icon: Parameters<typeof IconChip>[0]["icon"];
  tone: Parameters<typeof IconChip>[0]["tone"];
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <IconChip icon={icon} tone={tone} size="md" />
      <p className="text-[10px] text-foreground-muted">{label}</p>
      <p className="text-[13px] font-semibold text-foreground">{value}/5</p>
    </div>
  );
}
