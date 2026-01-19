import { cn } from "@/lib/utils";

export type StatusBadgeVariant = "normal" | "high-risk" | "emergency" | "pending" | "active" | "offline";

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<StatusBadgeVariant, string> = {
  normal: "bg-success/10 text-success border-success/20",
  "high-risk": "bg-warning/10 text-warning border-warning/20",
  emergency: "bg-emergency/10 text-emergency border-emergency/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  active: "bg-success/10 text-success border-success/20",
  offline: "bg-muted text-muted-foreground border-muted-foreground/20",
};

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wide",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
