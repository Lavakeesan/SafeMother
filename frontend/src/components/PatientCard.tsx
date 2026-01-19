import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { StatusBadge, StatusBadgeVariant } from "./StatusBadge";

interface PatientCardProps {
  name: string;
  id: string;
  gestationWeeks: number;
  status: StatusBadgeVariant;
  nextVisit?: string;
  urgency?: string;
  avatar?: string;
  isHighlighted?: boolean;
  onClick?: () => void;
}

export function PatientCard({
  name,
  id,
  gestationWeeks,
  status,
  nextVisit,
  urgency,
  avatar,
  isHighlighted = false,
  onClick,
}: PatientCardProps) {
  const statusLabels: Record<StatusBadgeVariant, string> = {
    normal: "Normal",
    "high-risk": "High Risk",
    emergency: "Emergency",
    pending: "Pending",
    active: "Active",
    offline: "Offline",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 bg-card rounded-xl border cursor-pointer transition-all hover:shadow-card-hover",
        isHighlighted && "border-l-4 border-l-emergency bg-emergency/5",
        status === "high-risk" && !isHighlighted && "border-l-4 border-l-warning"
      )}
    >
      <div className="w-12 h-12 rounded-full bg-muted overflow-hidden flex-shrink-0">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground font-medium">
            {name.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-semibold",
          status === "emergency" ? "text-emergency" : "text-foreground"
        )}>
          {name}
        </p>
        <p className="text-sm text-muted-foreground">
          ID: {id} • {gestationWeeks} Weeks Pregnant
          {status === "emergency" && " • Active Alert"}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        {nextVisit && (
          <>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {urgency ? "Urgency" : "Next Visit"}
            </p>
            <p className={cn(
              "text-sm font-medium",
              urgency ? "text-emergency" : "text-foreground"
            )}>
              {urgency || nextVisit}
            </p>
          </>
        )}
      </div>

      <StatusBadge variant={status}>{statusLabels[status]}</StatusBadge>

      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </div>
  );
}
