import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type ChipTone = "mint" | "sky" | "lavender" | "peach" | "rose";

const toneClasses: Record<ChipTone, string> = {
  mint: "bg-chip-mint-bg text-chip-mint-icon",
  sky: "bg-chip-sky-bg text-chip-sky-icon",
  lavender: "bg-chip-lavender-bg text-chip-lavender-icon",
  peach: "bg-chip-peach-bg text-chip-peach-icon",
  rose: "bg-chip-rose-bg text-chip-rose-icon",
};

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

interface IconChipProps {
  icon: LucideIcon;
  tone: ChipTone;
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function IconChip({ icon: Icon, tone, size = "md", className }: IconChipProps) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center flex-shrink-0",
        toneClasses[tone],
        sizeClasses[size],
        className
      )}
    >
      <Icon size={size === "sm" ? 12 : size === "lg" ? 18 : 15} strokeWidth={2} />
    </div>
  );
}
