import { cn } from "@/lib/utils";
import { ChevronRight, AlertTriangle, Calendar } from "lucide-react";
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
  onAlert?: (e: React.MouseEvent) => void;
  onAppointment?: (e: React.MouseEvent) => void;
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
  onAlert,
  onAppointment,
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
        <div className="flex items-center gap-2">
          <p className={cn(
            "font-semibold",
            status === "emergency" ? "text-emergency" : "text-foreground"
          )}>
            {name}
          </p>
          {onAlert && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAlert(e);
              }}
              className="p-1.5 rounded-full bg-emergency/10 text-emergency hover:bg-emergency/20 transition-colors"
              title="Send Emergency SMS"
            >
              <AlertTriangle className="h-4 w-4" />
            </button>
          )}
          {onAppointment && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAppointment(e);
              }}
              className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors ml-1"
              title="Schedule Physician Appointment"
            >
              <Calendar className="h-4 w-4" />
            </button>
          )}
        </div>
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
