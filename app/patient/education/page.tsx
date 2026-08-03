"use client";

import { Play, GraduationCap } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { resolvePatientId } from "@/lib/constants/account-patient-map";
import { educationVideos } from "@/lib/mock/fixtures";
import { Card } from "@/components/ui/card";

export default function PatientEducationPage() {
  const account = useAuthStore((s) => s.currentAccount);
  const patientId = account ? resolvePatientId(account.id) : undefined;

  const recommended = educationVideos.filter((v) => patientId && v.recommendedFor.includes(patientId));
  const rest = educationVideos.filter((v) => !recommended.some((r) => r.id === v.id));

  return (
    <div className="px-4">
      {recommended[0] && (
        <Card className="mb-4 !p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-brand-700 to-brand-900 h-32 flex items-center justify-center relative">
            <button
              aria-label={`Play ${recommended[0].title}`}
              className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center"
            >
              <Play size={18} className="text-brand-600 ml-0.5" fill="currentColor" />
            </button>
            <span className="absolute top-2 left-2 text-[10px] font-medium text-white bg-white/15 rounded-full px-2 py-0.5">
              Recommended for you
            </span>
          </div>
          <div className="p-3">
            <p className="text-sm font-semibold text-foreground">{recommended[0].title}</p>
            <p className="text-[11px] text-foreground-muted mt-0.5">{recommended[0].durationLabel}</p>
          </div>
        </Card>
      )}

      <p className="text-xs text-foreground-muted mb-2">All videos</p>
      <div className="grid grid-cols-2 gap-3">
        {rest.map((video) => (
          <Card key={video.id} className="!p-0 overflow-hidden">
            <div className="bg-surface-sunken h-20 flex items-center justify-center relative">
              <GraduationCap size={20} className="text-brand-300" />
              <span className="absolute bottom-1 right-1 text-[9px] font-medium text-white bg-foreground/70 rounded px-1.5 py-0.5">
                {video.durationLabel}
              </span>
            </div>
            <div className="p-2.5">
              <p className="text-[11px] font-medium text-foreground leading-snug">{video.title}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
