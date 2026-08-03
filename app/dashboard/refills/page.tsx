"use client";

import { toast } from "react-toastify";
import { usePatientsStore } from "@/stores/patients-store";
import { CardRow } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function RefillsPage() {
  const refillRequests = usePatientsStore((s) => s.refillRequests);
  const patients = usePatientsStore((s) => s.patients);
  const approveRefill = usePatientsStore((s) => s.approveRefill);
  const denyRefill = usePatientsStore((s) => s.denyRefill);

  function handleApprove(id: string) {
    approveRefill(id);
    toast.success("Refill approved!");
  }
  function handleDeny(id: string) {
    denyRefill(id);
    toast.info("Refill denied.");
  }

  return (
    <div className="px-4">
      <p className="text-xs text-foreground-muted mb-3">Refill requests</p>
      <div className="flex flex-col gap-2">
        {refillRequests.map((r) => {
          const patientName = patients[r.patientId]?.patientName ?? r.patientId;
          return (
            <CardRow key={r.id}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-[13px] font-medium text-foreground">{r.medicationName}</p>
                  <p className="text-[11px] text-foreground-muted">
                    {patientName} &middot; requested {format(new Date(r.requestedAt), "MMM d")}
                  </p>
                </div>
                {r.status !== "pending" && (
                  <Badge tone={r.status === "approved" ? "success" : "danger"} className="capitalize">
                    {r.status}
                  </Badge>
                )}
              </div>
              {r.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(r.id)} className="flex-1">
                    Approve
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleDeny(r.id)} className="flex-1">
                    Deny
                  </Button>
                </div>
              )}
            </CardRow>
          );
        })}
      </div>
    </div>
  );
}
