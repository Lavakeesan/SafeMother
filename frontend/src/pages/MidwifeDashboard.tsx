import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { PatientCard } from "@/components/PatientCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Baby, AlertTriangle, Zap, Search, Calendar, Edit, Upload, FileText, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const patients = [
  {
    id: "PC-2044",
    name: "Sarah Jenkins",
    gestationWeeks: 34,
    status: "normal" as const,
    nextVisit: "Tomorrow, 10:00 AM",
  },
  {
    id: "PC-1982",
    name: "Maria Gonzalez",
    gestationWeeks: 28,
    status: "high-risk" as const,
    nextVisit: "Pending Review",
  },
  {
    id: "PC-2103",
    name: "Li Wei",
    gestationWeeks: 39,
    status: "normal" as const,
    nextVisit: "Today, 2:30 PM",
  },
  {
    id: "PC-3021",
    name: "Amara Okafor",
    gestationWeeks: 36,
    status: "emergency" as const,
    urgency: "STABILIZING",
  },
];

const schedule = [
  { name: "Li Wei", time: "02:30 PM", type: "Routine Checkup", active: true },
  { name: "Jane Doe", time: "04:00 PM", type: "Initial Consultation" },
  { name: "Sarah Jenkins", time: "Tomorrow, 10:00 AM", type: "Scan Review" },
];

export default function MidwifeDashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar variant="midwife" userName="Dr. Elena Ross" userRole="Senior Midwife" />

      <div className="flex-1 flex flex-col">
        <Header
          title="Midwife Dashboard"
          subtitle="Care management for St. Jude Maternal Ward • Oct 24, 2023"
          showRegisterPatient
        />

        <main className="flex-1 p-8 overflow-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
            {/* Stats Grid */}
            <div className="xl:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Active Patients"
                value={128}
                trend={{ value: "+4% vs last month", positive: true }}
                icon={Users}
              />
              <StatCard
                title="Due Today"
                value={3}
                subtitle="Estimated delivery"
                icon={Baby}
              />
              <StatCard
                title="High Risk"
                value={12}
                trend={{ value: "+2 since yesterday", positive: false }}
                icon={AlertTriangle}
                iconColor="text-warning"
              />
              <StatCard
                title="Alerts"
                value={2}
                subtitle="Requires Attention"
                icon={Zap}
                iconColor="text-emergency"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-xl border p-5">
              <h3 className="font-semibold text-foreground mb-4 uppercase text-xs tracking-wide">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2 text-primary border-primary/20 hover:bg-primary/5">
                  <Edit className="h-4 w-4" />
                  Log New Observation
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 text-primary border-primary/20 hover:bg-primary/5">
                  <Upload className="h-4 w-4" />
                  Upload Lab Results
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 text-primary border-primary/20 hover:bg-primary/5">
                  <FileText className="h-4 w-4" />
                  Generate Referral Form
                </Button>
              </div>
            </div>
          </div>

          <div className="grid xl:grid-cols-3 gap-6">
            {/* Patient List */}
            <div className="xl:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Assigned Patients</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">All</Button>
                  <Button variant="secondary" size="sm" className="bg-warning/10 text-warning border-warning/20">
                    High Risk
                  </Button>
                  <Button variant="outline" size="sm">Emergency</Button>
                </div>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients by name, ID, or risk status..."
                  className="pl-10"
                />
              </div>

              <div className="space-y-3">
                {patients.map((patient) => (
                  <PatientCard
                    key={patient.id}
                    name={patient.name}
                    id={patient.id}
                    gestationWeeks={patient.gestationWeeks}
                    status={patient.status}
                    nextVisit={patient.nextVisit}
                    urgency={patient.urgency}
                    isHighlighted={patient.status === "emergency"}
                    onClick={() => navigate("/midwife/patients/1")}
                  />
                ))}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Schedule */}
              <div className="bg-card rounded-xl border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground uppercase text-xs tracking-wide">
                    Schedule
                  </h3>
                  <Link to="/midwife/calendar" className="text-xs text-primary hover:underline">
                    View Calendar
                  </Link>
                </div>

                <div className="space-y-4">
                  {schedule.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${item.active ? "bg-success" : "bg-muted-foreground/30"}`} />
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.time} • {item.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Alerts */}
              <div className="bg-card rounded-xl border p-5">
                <h3 className="font-semibold text-emergency uppercase text-xs tracking-wide mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Critical Alerts
                </h3>

                <div className="bg-emergency/5 border border-emergency/20 rounded-lg p-4">
                  <p className="font-medium text-foreground">High BP: Maria Gonzalez</p>
                  <p className="text-sm text-muted-foreground">
                    Auto-logged from home monitoring at 08:45 AM.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
