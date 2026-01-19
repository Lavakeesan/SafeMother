import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon, LayoutDashboard, Users, Calendar, FileText, Settings, BookOpen, AlertTriangle, MessageSquare, ShieldCheck, Activity, HelpCircle, UserCog } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  variant: "midwife" | "patient" | "admin";
  userName?: string;
  userRole?: string;
  userAvatar?: string;
}

const midwifeNav: NavItem[] = [
  { label: "Dashboard", href: "/midwife", icon: LayoutDashboard },
  { label: "Patients", href: "/midwife/patients", icon: Users },
  { label: "Calendar", href: "/midwife/calendar", icon: Calendar },
  { label: "Clinical Reports", href: "/midwife/reports", icon: FileText },
  { label: "Settings", href: "/midwife/settings", icon: Settings },
];

const patientNav: NavItem[] = [
  { label: "My Dashboard", href: "/patient", icon: LayoutDashboard },
  { label: "Care Plan", href: "/patient/care-plan", icon: FileText },
  { label: "Midwife Advice", href: "/patient/advice", icon: MessageSquare },
  { label: "Resources", href: "/patient/resources", icon: BookOpen },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "System Admin", href: "/admin/system", icon: UserCog },
  { label: "Guidelines", href: "/admin/guidelines", icon: BookOpen },
  { label: "Audit Trail", href: "/admin/audit", icon: Activity },
  { label: "Config", href: "/admin/config", icon: Settings },
];

const navConfigs = {
  midwife: midwifeNav,
  patient: patientNav,
  admin: adminNav,
};

const brandConfigs = {
  midwife: { name: "MaternalCare", subtitle: "Midwife Portal" },
  patient: { name: "MaternalCare", subtitle: "Patient Portal" },
  admin: { name: "MidwifeLink", subtitle: "Admin Control" },
};

export function Sidebar({ variant, userName, userRole, userAvatar }: SidebarProps) {
  const location = useLocation();
  const navItems = navConfigs[variant];
  const brand = brandConfigs[variant];

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-sidebar border-r border-sidebar-border">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-foreground">{brand.name}</h1>
          <p className="text-xs text-muted-foreground">{brand.subtitle}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Emergency Hub (Midwife only) */}
      {variant === "midwife" && (
        <div className="px-3 py-4 border-t border-sidebar-border">
          <p className="px-3 mb-2 text-xs font-medium text-emergency uppercase tracking-wide">
            Emergency Hub
          </p>
          <Link
            to="/emergency"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emergency text-emergency-foreground rounded-lg font-medium hover:bg-emergency/90 transition-colors"
          >
            <AlertTriangle className="h-4 w-4" />
            Rapid Alert
          </Link>
        </div>
      )}

      {/* Patient Emergency Alert */}
      {variant === "patient" && (
        <div className="px-3 py-4 border-t border-sidebar-border">
          <Link
            to="/emergency"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emergency text-emergency-foreground rounded-lg font-medium hover:bg-emergency/90 transition-colors"
          >
            <AlertTriangle className="h-4 w-4" />
            Emergency Alert
          </Link>
        </div>
      )}

      {/* Admin Support Portal */}
      {variant === "admin" && (
        <div className="px-3 py-4 border-t border-sidebar-border">
          <Link
            to="/admin/support"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            Support Portal
          </Link>
        </div>
      )}

      {/* User Profile */}
      <div className="flex items-center gap-3 px-5 py-4 border-t border-sidebar-border">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-medium text-muted-foreground">
              {userName?.charAt(0) || "U"}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {userName || "User"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {userRole || "Staff"}
          </p>
        </div>
      </div>
    </aside>
  );
}
