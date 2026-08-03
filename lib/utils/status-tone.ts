import type { TriageRiskStatus } from "@/types/clinician-view";
import type { AlertSeverity } from "@/types/domain";

export function triageStatusToBadgeTone(status: TriageRiskStatus): "danger" | "warning" | "success" {
  if (status === "red") return "danger";
  if (status === "amber") return "warning";
  return "success";
}

export function alertSeverityToBadgeTone(severity: AlertSeverity): "danger" | "warning" | "success" {
  if (severity === "critical") return "danger";
  if (severity === "warning") return "warning";
  return "success";
}
