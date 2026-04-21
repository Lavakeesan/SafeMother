import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Bell, MessageSquare, Check, AlertTriangle,
  Info, Plus, Calendar, Stethoscope, User, ChevronLeft
} from "lucide-react";

export default function PatientProfilePage() {
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/patients/${id}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setPatient(data);
        }
      } catch (error) {
        console.error("Failed to fetch patient:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading patient profile...</div>;
  }

  if (!patient) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold">Patient Not Found</h2>
        <Link to="/midwife/patients">
          <Button variant="outline">Back to Patients</Button>
        </Link>
      </div>
    );
  }

  // Use real data from DB
  const symptoms = [
    {
      type: "severe",
      icon: AlertTriangle,
      title: "Visual Disturbances",
      time: "Today, 09:15 AM",
      iconBg: "bg-emergency/10",
      iconColor: "text-emergency"
    },
  ];

  const clinicalNotes = [
    {
      date: "Original Record",
      author: "SYSTEM",
      title: "Patient Registered",
      content: `Initial status set to ${patient.status}. MRN: ${patient.mrn}.`,
      active: true,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar variant="midwife" userName="Dr. Elena Ross" userRole="Senior Midwife" />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 bg-card border-b">
          <div className="flex items-center gap-4 flex-1">
            <Link to="/midwife/patients">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search symptoms or notes..."
                className="pl-10 bg-muted/50 border-0"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emergency rounded-full" />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          {/* Patient Header */}
          <div className="bg-card rounded-xl border p-6 mb-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center overflow-hidden">
                <User className="h-10 w-10 text-primary" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-foreground">{patient.name}</h1>
                  <StatusBadge variant={patient.riskLevel === 'High' ? 'high-risk' : (patient.riskLevel === 'Medium' ? 'pending' : 'normal')}>{patient.riskLevel.toUpperCase()}</StatusBadge>
                </div>
                <p className="text-muted-foreground mb-3">
                  {patient.gestationWeeks} Weeks Gestation • Next Visit: {patient.nextVisit || "Not Scheduled"}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Stethoscope className="h-4 w-4" />
                    MRN: {patient.mrn}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Age: {patient.age}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    Phone: {patient.contactNumber}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Log Observation
                </Button>
                <Button variant="outline">Clinical Chart</Button>
              </div>
            </div>
          </div>

          <div className="grid xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              {/* Gestational Progress */}
              <div className="bg-card rounded-xl border p-6">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Gestational Progress
                </h3>

                <div className="flex items-center justify-between">
                  {[
                    { label: "1st Trimester", sublabel: "Weeks 1-12", completed: true },
                    { label: "2nd Trimester", sublabel: "Weeks 13-26", completed: true },
                    { label: "3rd Trimester", sublabel: `Wk ${patient.gestationWeeks}`, current: true },
                    { label: "Delivery", sublabel: "Week 40", icon: Calendar },
                    { label: "Postnatal", sublabel: "Weeks 40+", icon: User },
                  ].map((step, i) => (
                    <div key={i} className="flex flex-col items-center relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.completed ? "bg-primary text-primary-foreground" :
                        step.current ? "border-2 border-primary bg-card text-primary" :
                          "border border-muted-foreground/30 bg-muted text-muted-foreground"
                        }`}>
                        {step.completed ? (
                          <Check className="h-5 w-5" />
                        ) : step.current ? (
                          <div className="relative">
                            <User className="h-4 w-4" />
                            {patient.status === 'emergency' && <span className="absolute -top-1 -right-1 w-2 h-2 bg-emergency rounded-full" />}
                          </div>
                        ) : step.icon ? (
                          <step.icon className="h-4 w-4" />
                        ) : null}
                      </div>
                      <p className={`mt-2 text-xs font-medium ${step.current ? "text-primary" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                      <p className={`text-xs ${step.current ? "text-primary" : "text-muted-foreground/70"}`}>
                        {step.sublabel}
                      </p>
                      {i < 4 && (
                        <div className={`absolute top-5 left-full w-full h-0.5 -translate-x-1/2 ${step.completed ? "bg-primary" : "bg-muted-foreground/20"
                          }`} style={{ width: "calc(100% - 2.5rem)" }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-card rounded-xl border p-5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Blood Pressure
                  </p>
                  <p className="text-2xl font-bold">
                    <span className="text-foreground">--</span>
                    <span className="text-foreground">/</span>
                    <span className="text-foreground">--</span>
                    <span className="text-sm text-muted-foreground font-normal ml-1">mmHg</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 italic text-center">No data today</p>
                </div>

                <div className="bg-card rounded-xl border p-5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Weight
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    -- <span className="text-sm text-muted-foreground font-normal">kg</span>
                  </p>
                </div>

                <div className="bg-card rounded-xl border p-5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Fetal Heart Rate
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    -- <span className="text-sm text-muted-foreground font-normal">bpm</span>
                  </p>
                </div>
              </div>

              {/* Symptom Log */}
              <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    Symptom Log
                  </h3>
                  <Link to="#" className="text-sm text-primary hover:underline">View All</Link>
                </div>

                <div className="space-y-3">
                  <div className="text-center py-4 bg-muted/20 rounded-lg">
                    <p className="text-sm text-muted-foreground italic">No symptoms reported by patient today.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Clinical Notes
                </h3>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4 text-primary" />
                </Button>
              </div>

              <div className="space-y-4">
                {clinicalNotes.map((note, i) => (
                  <div key={i} className="relative pl-4 border-l-2 border-muted">
                    {note.active && (
                      <div className="absolute left-0 top-0 w-2 h-2 rounded-full bg-primary -translate-x-[5px]" />
                    )}
                    <p className="text-xs text-primary font-medium">
                      {note.date} • {note.author}
                    </p>
                    <p className="font-medium text-foreground mt-1">{note.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{note.content}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Input
                  placeholder="Write a quick note..."
                  className="bg-muted/50"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Add missing icons
import { Activity, FileText } from "lucide-react";
