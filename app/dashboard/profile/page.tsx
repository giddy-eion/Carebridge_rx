"use client";

import { useAuthStore } from "@/stores/auth-store";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import type { ClinicianAccount } from "@/types/domain";

export default function ClinicianProfilePage() {
  const account = useAuthStore((s) => s.currentAccount) as ClinicianAccount | null;
  if (!account) return null;

  return (
    <div className="px-4">
      <Card className="flex items-center gap-3 mb-4">
        <Avatar name={account.name} size="lg" />
        <div>
          <p className="text-sm font-semibold text-foreground">{account.name}</p>
          <p className="text-[11px] text-foreground-muted">{account.department}</p>
        </div>
      </Card>
      <Card className="flex flex-col gap-3">
        <Row label="Hospital" value={account.hospital} />
        <Row label="Department" value={account.department} />
        <Row label="NPI" value={account.npiId} />
        <Row label="Signature" value={account.clinicalNotesSignature} />
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[12px] text-foreground-muted">{label}</span>
      <span className="text-[12px] text-foreground font-medium text-right">{value}</span>
    </div>
  );
}
