"use client";

import { Card } from "@/components/ui/card";

export default function PatientTermsPage() {
  return (
    <div className="px-4">
      <Card className="flex flex-col gap-3">
        <p className="text-[11px] text-foreground-muted leading-relaxed">
          CareBridge Rx is a demonstration prototype. All patient, caregiver, and clinician data shown is
          fictional and generated for illustrative purposes only.
        </p>
        <p className="text-[11px] text-foreground-muted leading-relaxed">
          In a production release, this screen would contain the platform&apos;s full Terms of Service and
          Privacy Policy, covering HIPAA-aligned data handling, consent, and data retention practices.
        </p>
      </Card>
    </div>
  );
}
