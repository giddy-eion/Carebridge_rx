import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-surface-raised rounded-2xl p-4 shadow-[0_4px_14px_rgba(16,22,43,0.06)]",
        className
      )}
      {...props}
    />
  );
}

export function CardRow({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-surface-raised rounded-xl px-3 py-2.5 shadow-[0_2px_8px_rgba(16,22,43,0.05)]",
        className
      )}
      {...props}
    />
  );
}
