import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon, LayoutDashboard, Users, Calendar, FileText, Settings, BookOpen, AlertTriangle, MessageSquare, ShieldCheck, Activity, HelpCircle, UserCog, LogOut, Stethoscope, ClipboardList } from "lucide-react";

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
  { label: "Medical Alerts", href: "/midwife/calendar", icon: AlertTriangle },
  { label: "Clinical Reports", href: "/midwife/reports", icon: FileText },
];

const patientNav: NavItem[] = [
  { label: "My Dashboard", href: "/patient", icon: LayoutDashboard },
  { label: "Care Plans", href: "/patient/advice", icon: MessageSquare },
  { label: "Clinic Reports", href: "/patient/reports", icon: FileText },
  { label: "Midwife Alert", href: "/patient/alert", icon: AlertTriangle },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: UserCog },
  { label: "Midwives", href: "/admin/midwives", icon: Stethoscope },
  { label: "Patients", href: "/admin/patients", icon: Users },
  { label: "Appointments", href: "/admin/appointments", icon: Calendar },
  { label: "Alerts", href: "/admin/alerts", icon: AlertTriangle },
  { label: "Guidelines", href: "/admin/guidelines", icon: BookOpen },
];

const navConfigs = {
  midwife: midwifeNav,
  patient: patientNav,
  admin: adminNav,
};

const brandConfigs = {
  midwife: { name: "SafeMother", subtitle: "Midwife Portal" },
  patient: { name: "SafeMother", subtitle: "Patient Portal" },
  admin: { name: "SafeMother", subtitle: "Admin Control" },
};

export function Sidebar({ variant, userName, userRole, userAvatar }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = navConfigs[variant];
  const brand = brandConfigs[variant];

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-sidebar border-r border-sidebar-border">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border hover:bg-sidebar-accent/50 transition-colors group">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden border bg-background flex-shrink-0 group-hover:scale-105 transition-transform">
          <img src="/logo.jpeg" alt="SafeMother Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="font-bold text-foreground group-hover:text-primary transition-colors">{brand.name}</h1>
          <p className="text-xs text-muted-foreground">{brand.subtitle}</p>
        </div>
      </Link>

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






      {/* Logout Button */}
      <div className="px-3 py-2 border-t border-sidebar-border mb-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-bold text-emergency bg-emergency/5 hover:bg-emergency/10 transition-all active:scale-95"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
