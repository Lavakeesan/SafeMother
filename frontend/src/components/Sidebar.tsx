import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon, LayoutDashboard, Users, Calendar, FileText, Settings, BookOpen, AlertTriangle, MessageSquare, ShieldCheck, Activity, HelpCircle, UserCog, LogOut, Stethoscope, ClipboardList } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  variant: "midwife" | "patient" | "admin" | "doctor";
  userName?: string;
  userRole?: string;
  userAvatar?: string;
}

const midwifeNav: NavItem[] = [
  { label: "Dashboard", href: "/midwife", icon: LayoutDashboard },
  { label: "Patients", href: "/midwife/patients", icon: Users },
  { label: "Schedule Consultation", href: "/midwife/appointments", icon: Stethoscope },
  { label: "Medical Alerts", href: "/midwife/calendar", icon: AlertTriangle },
  { label: "Clinical Reports", href: "/midwife/reports", icon: FileText },
];

const patientNav: NavItem[] = [
  { label: "My Dashboard", href: "/patient", icon: LayoutDashboard },
  { label: "Chat with Doctor", href: "/patient/chat", icon: MessageSquare },
  { label: "Clinic Reports", href: "/patient/reports", icon: FileText },
  { label: "Midwife Alert", href: "/patient/alert", icon: AlertTriangle },
  { label: "Care Plans", href: "/patient/advice", icon: MessageSquare },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: UserCog },
  { label: "Midwifes", href: "/admin/midwifes", icon: Stethoscope },
  { label: "Doctors", href: "/admin/doctors", icon: ClipboardList },
  { label: "Patients", href: "/admin/patients", icon: Users },
  { label: "Appointments", href: "/admin/appointments", icon: Calendar },
  { label: "Alerts", href: "/admin/alerts", icon: AlertTriangle },
  { label: "Guidelines", href: "/admin/guidelines", icon: BookOpen },
];

const doctorNav: NavItem[] = [
  { label: "Overview", href: "/doctor", icon: LayoutDashboard },
  { label: "My Patients", href: "/doctor/patients", icon: Users },
  { label: "Appointments", href: "/doctor/consultations", icon: Calendar },
  { label: "Secure Chat", href: "/doctor/chat", icon: MessageSquare },
];

const navConfigs = {
  midwife: midwifeNav,
  patient: patientNav,
  admin: adminNav,
  doctor: doctorNav,
};

const brandConfigs = {
  midwife: { name: "SafeMother", subtitle: "Midwife Portal" },
  patient: { name: "SafeMother", subtitle: "Patient Portal" },
  admin: { name: "SafeMother", subtitle: "Admin Control" },
  doctor: { name: "SafeMother", subtitle: "Physician Hub" },
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
    <aside className="hidden lg:flex flex-col w-72 min-h-screen bg-white border-r border-gray-100 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.02)] z-50">
      {/* Brand */}
      <div className="flex flex-col items-center justify-center pt-10 pb-10 border-b border-gray-50/50">
        <Link to="/" className="flex flex-col items-center gap-4 group">
          <div className="relative">
            <div className="absolute inset-0 bg-teal-400 rounded-2xl rotate-6 opacity-20 group-hover:rotate-12 transition-transform shadow-lg" />
            <div className="relative flex items-center justify-center w-16 h-16 rounded-[1.5rem] overflow-hidden border-2 border-white shadow-xl bg-white group-hover:scale-105 transition-transform">
              <img src="/logo.jpeg" alt="SafeMother Logo" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div className="text-center px-4">
            <h1 className="font-black text-xl text-gray-900 tracking-tighter group-hover:text-teal-600 transition-colors uppercase">{brand.name}</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-0.5">{brand.subtitle}</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-10 space-y-3 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-[1.5rem] text-sm font-black transition-all group relative overflow-hidden",
                isActive
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-100"
                  : "text-gray-400 hover:text-teal-600 hover:bg-teal-50"
              )}
            >
              {isActive && (
                <div className="absolute left-0 w-1.5 h-6 bg-white/40 rounded-r-full" />
              )}
              <item.icon className={cn(
                "h-5 w-5 transition-transform group-hover:scale-110",
                isActive ? "text-white" : "text-gray-300 group-hover:text-teal-500"
              )} />
              <span className="uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-6 border-t border-gray-50">
        <div className="mb-6 px-2 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
             <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-900 uppercase">Authenticated</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Session Active</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-3 w-full px-5 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.1em] text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm"
        >
          <LogOut className="h-4 w-4" />
          Secure Exit
        </button>
      </div>
    </aside>
  );
}
