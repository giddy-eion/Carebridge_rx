"use client";

import { Award, QrCode } from "lucide-react";
import { johnCertificate } from "@/lib/mock/fixtures";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

export default function PatientCertificatePage() {
  const cert = johnCertificate;

  return (
    <div className="px-4">
      <Card className="text-center bg-gradient-to-b from-brand-50 to-surface-raised">
        <div className="w-16 h-16 rounded-full bg-brand-500 text-white flex items-center justify-center mx-auto mb-3">
          <Award size={26} />
        </div>
        <p className="text-[11px] text-foreground-muted uppercase tracking-wide">Adherence Certificate</p>
        <p className="font-display font-semibold text-xl text-foreground mt-1">{cert.patientName}</p>
        <p className="text-sm text-brand-600 font-medium mt-1">{cert.streakDays}-Day Streak</p>
        <p className="text-[11px] text-foreground-muted mt-2">
          Issued {format(new Date(cert.issuedAt), "MMMM d, yyyy")}
        </p>

        <div className="w-24 h-24 rounded-xl bg-surface-sunken flex items-center justify-center mx-auto mt-4">
          <QrCode size={48} className="text-foreground-muted" />
        </div>
        <p className="text-[10px] text-foreground-muted mt-2 break-all">{cert.qrCodeData}</p>
      </Card>

      <p className="text-[11px] text-foreground-muted text-center mt-4 px-4">
        Share this certificate with your care team as proof of consistent medication adherence.
      </p>
    </div>
  );
}
