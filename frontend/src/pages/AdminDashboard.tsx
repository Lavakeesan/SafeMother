import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Bell, HelpCircle, Download, UserPlus, 
  Users, FileText, Activity, Shield, ChevronLeft, 
  ChevronRight, Check, Clock, AlertTriangle
} from "lucide-react";

const practitioners = [
  {
    initials: "EJ",
    name: "Elena Jenkins",
    email: "elena.j@healthcare.com",
    role: "Certified Midwife",
    specialty: "Postnatal Care",
    lastActivity: "2 hours ago",
    status: "active" as const,
  },
  {
    initials: "MA",
    name: "Marcus Aris",
    email: "marcus.aris@midwifelink.org",
    role: "Guest Admin",
    specialty: "Labor Support",
    lastActivity: "2 days ago",
    status: "pending" as const,
  },
  {
    initials: "SR",
    name: "Sofia Rodriguez",
    email: "s.rodriguez@hospital.net",
    role: "Nurse Specialist",
    specialty: "Antenatal Screening",
    lastActivity: "15 mins ago",
    status: "active" as const,
  },
  {
    initials: "DL",
    name: "David Lawson",
    email: "david.l@healthsys.gov",
    role: "Midwife",
    specialty: "Home Birth Support",
    lastActivity: "Offline",
    status: "offline" as const,
  },
];

const tabs = [
  { id: "users", label: "User Management", icon: Users },
  { id: "guidelines", label: "Guidelines Editor", icon: FileText },
  { id: "health", label: "System Health", icon: Activity },
  { id: "permissions", label: "Role Permissions", icon: Shield },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        variant="admin" 
        userName="Dr. Sarah Chen" 
        userRole="Chief Administrator" 
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 bg-card border-b">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">System</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Admin Management</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search midwi..."
                className="w-48 pl-10 bg-muted/50 border-0"
              />
            </div>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full" />
            </Button>

            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
            </Button>

            <div className="flex items-center gap-3 pl-4 border-l">
              <div className="text-right">
                <p className="font-medium text-foreground text-sm">Dr. Sarah Chen</p>
                <p className="text-xs text-muted-foreground">Chief Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-medium">SC</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Page Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">System Administration</h1>
                  <p className="text-muted-foreground">
                    Manage maternal care practitioners, clinical guideline protocols, and platform health metrics.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export Data
                  </Button>
                  <Button className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Provision New User
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "text-primary border-primary"
                        : "text-muted-foreground border-transparent hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-muted-foreground">Filter By:</span>
                <select className="px-3 py-2 bg-card border rounded-lg text-sm">
                  <option>All Roles</option>
                  <option>Midwife</option>
                  <option>Nurse</option>
                  <option>Admin</option>
                </select>
                <select className="px-3 py-2 bg-card border rounded-lg text-sm">
                  <option>Active Status</option>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Offline</option>
                </select>
                <span className="ml-auto text-sm text-muted-foreground">
                  Displaying 1-12 of 142 Midwives
                </span>
              </div>

              {/* User Table */}
              <div className="bg-card rounded-xl border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-6 py-4">
                        Practitioner
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-4">
                        Clinical Role
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-4">
                        Specialty
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-4">
                        Last Activity
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-4">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {practitioners.map((user, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                              user.status === "active" ? "bg-primary text-primary-foreground" :
                              user.status === "pending" ? "bg-warning text-warning-foreground" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {user.initials}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.role === "Guest Admin" 
                              ? "bg-warning/10 text-warning" 
                              : "bg-primary/10 text-primary"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">{user.specialty}</td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">{user.lastActivity}</td>
                        <td className="px-4 py-4">
                          <StatusBadge variant={user.status}>{user.status}</StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <Button variant="outline" size="sm">Previous</Button>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded bg-primary text-primary-foreground text-sm font-medium">1</button>
                    <button className="w-8 h-8 rounded text-muted-foreground hover:bg-muted text-sm">2</button>
                    <button className="w-8 h-8 rounded text-muted-foreground hover:bg-muted text-sm">3</button>
                    <span className="text-muted-foreground">...</span>
                    <button className="w-8 h-8 rounded text-muted-foreground hover:bg-muted text-sm">12</button>
                  </div>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-card rounded-xl border p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Last 30 Days</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">24 Updates</p>
                  <p className="text-sm text-muted-foreground">Medical Guidelines revised by Clinical Board</p>
                </div>

                <div className="bg-card rounded-xl border p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Review Required</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">7 Protocols</p>
                  <p className="text-sm text-muted-foreground">Pending peer-review validation</p>
                </div>

                <div className="bg-card rounded-xl border p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Check className="h-5 w-5 text-success" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Integrity Check</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">99.8% Uptime</p>
                  <p className="text-sm text-muted-foreground">API & Guidelines Database</p>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Quick Role Actions */}
              <div className="bg-card rounded-xl border p-5">
                <h3 className="font-semibold text-foreground mb-2">Quick Role Actions</h3>
                <p className="text-sm text-muted-foreground mb-4">Modify global platform constraints</p>

                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Guidelines Lockdown</span>
                    <div className="w-10 h-6 rounded-full bg-muted relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Restrict Editing
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Prevents all guideline edits during maintenance.
                  </p>
                </div>

                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Pending Approvals (3)
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Protocol #102</p>
                        <p className="text-xs text-muted-foreground">Review by Jane Doe</p>
                      </div>
                    </div>
                    <Check className="h-5 w-5 text-success" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserPlus className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">New Specialist</p>
                        <p className="text-xs text-muted-foreground">Verify Dr. Miller</p>
                      </div>
                    </div>
                    <Check className="h-5 w-5 text-success" />
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-card rounded-xl border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="h-5 w-5 text-success" />
                  <span className="font-medium text-success">System Status</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  All European nodes are currently synchronized. Clinical DB Version: 2.4.1-Stable.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
