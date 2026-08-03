import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  tone?: "brand" | "muted";
  className?: string;
}

const sizeClasses = { sm: "w-8 h-8 text-[10px]", md: "w-9 h-9 text-xs", lg: "w-11 h-11 text-sm" };

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function Avatar({ name, size = "md", tone = "brand", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold flex-shrink-0",
        tone === "brand" ? "bg-brand-500 text-white" : "bg-foreground-muted/40 text-white",
        sizeClasses[size],
        className
      )}
    >
      {initials(name)}
    </div>
  );
}
