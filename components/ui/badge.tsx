import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeTone = "danger" | "warning" | "success" | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  danger: "bg-danger-50 text-danger-600",
  warning: "bg-warning-50 text-warning-600",
  success: "bg-success-50 text-success-600",
  neutral: "bg-surface-sunken text-foreground-muted",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
