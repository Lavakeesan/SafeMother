import { Sidebar } from "@/components/Sidebar";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Bell, MessageSquare, Check, AlertTriangle, 
  Info, Plus, Calendar, Stethoscope, User 
} from "lucide-react";
import { Link } from "react-router-dom";

const symptoms = [
  { 
    type: "severe", 
    icon: AlertTriangle, 
    title: "Visual Disturbances", 
    time: "Today, 09:15 AM",
    iconBg: "bg-emergency/10",
    iconColor: "text-emergency"
  },
  { 
    type: "moderate", 
    icon: Info, 
    title: "Severe Headache", 
    time: "Today, 08:30 AM",
    iconBg: "bg-warning/10",
    iconColor: "text-warning"
  },
  { 
    type: "mild", 
    icon: Info, 
    title: "Mild Edema (Ankles)", 
    time: "Yesterday, 04:20 PM",
    iconBg: "bg-primary/10",
    iconColor: "text-primary"
  },
];

const clinicalNotes = [
  {
    date: "SEPT 12, 2023",
    author: "DR. ARIS",
    title: "Prescribed Labetalol 100mg BID",
    content: "Due to persistent elevated BP readings. Instructed patient on signs of worsening preeclampsia. Scheduled follow-up in 48 hours.",
    active: true,
  },
  {
    date: "SEPT 05, 2023",
    author: "MIDWIFE SARAH",
    title: "GTT Screening Completed",
    content: "Results within normal limits. Patient reports increased fatigue but consistent fetal movement. Advised on iron-rich diet.",
  },
  {
    date: "AUG 22, 2023",
    author: "MIDWIFE SARAH",
    title: "Anatomy Scan Review",
    content: "Normal development confirmed. Growth in 65th percentile. Cervical length stable.",
  },
];

export default function PatientProfilePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar variant="midwife" userName="Sarah Jenkins" userRole="Senior Midwife" />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 bg-card border-b">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients, MRN, or symptoms..."
              className="pl-10 bg-muted/50 border-0"
            />
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
                  <h1 className="text-2xl font-bold text-foreground">Elena Rodriguez</h1>
                  <StatusBadge variant="high-risk">High Risk: Preeclampsia</StatusBadge>
                </div>
                <p className="text-muted-foreground mb-3">
                  32 Weeks 4 Days Gestation • EDD: Oct 24, 2023
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Stethoscope className="h-4 w-4" />
                    MRN: 884-291
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Age: 29
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    G2 P1
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Log Vitals
                </Button>
                <Button variant="outline">Transfer Care</Button>
              </div>
            </div>
          </div>

          <div className="grid xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              {/* Gestational Progress */}
              <div className="bg-card rounded-xl border p-6">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                  <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12h4l3-9 3 18 3-9h5" />
                  </svg>
                  Gestational Progress
                </h3>

                <div className="flex items-center justify-between">
                  {[
                    { label: "1st Trimester", sublabel: "Weeks 1-12", completed: true },
                    { label: "2nd Trimester", sublabel: "Weeks 13-26", completed: true },
                    { label: "3rd Trimester", sublabel: "Wk 32 (Current)", current: true },
                    { label: "Delivery", sublabel: "Week 40", icon: Calendar },
                    { label: "Postnatal", sublabel: "Weeks 40+", icon: User },
                  ].map((step, i) => (
                    <div key={i} className="flex flex-col items-center relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed ? "bg-primary text-primary-foreground" :
                        step.current ? "border-2 border-primary bg-card text-primary" :
                        "border border-muted-foreground/30 bg-muted text-muted-foreground"
                      }`}>
                        {step.completed ? (
                          <Check className="h-5 w-5" />
                        ) : step.current ? (
                          <div className="relative">
                            <User className="h-4 w-4" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emergency rounded-full" />
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
                        <div className={`absolute top-5 left-full w-full h-0.5 -translate-x-1/2 ${
                          step.completed ? "bg-primary" : "bg-muted-foreground/20"
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
                    <span className="text-emergency">142</span>
                    <span className="text-foreground">/</span>
                    <span className="text-emergency">92</span>
                    <span className="text-sm text-muted-foreground font-normal ml-1">mmHg</span>
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="h-8 w-16">
                      <svg viewBox="0 0 64 32" className="w-full h-full">
                        <path d="M0 16 L10 20 L20 12 L30 24 L40 8 L50 20 L64 16" fill="none" stroke="hsl(var(--emergency))" strokeWidth="2" />
                      </svg>
                    </div>
                    <span className="text-xs text-emergency font-medium flex items-center gap-1">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 12h4l3-9 3 18 3-9h5" />
                      </svg>
                      High
                    </span>
                  </div>
                </div>

                <div className="bg-card rounded-xl border p-5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Weight
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    74.5 <span className="text-sm text-muted-foreground font-normal">kg</span>
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="h-8 w-16">
                      <svg viewBox="0 0 64 32" className="w-full h-full">
                        <path d="M0 24 L16 20 L32 16 L48 12 L64 8" fill="none" stroke="hsl(var(--success))" strokeWidth="2" />
                      </svg>
                    </div>
                    <span className="text-xs text-success font-medium flex items-center gap-1">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 12h4l3-9 3 18 3-9h5" />
                      </svg>
                      +1.2kg
                    </span>
                  </div>
                </div>

                <div className="bg-card rounded-xl border p-5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Fetal Heart Rate
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    145 <span className="text-sm text-muted-foreground font-normal">bpm</span>
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="h-8 w-16">
                      <svg viewBox="0 0 64 32" className="w-full h-full">
                        <path d="M0 16 L8 16 L12 8 L16 24 L20 8 L24 24 L28 16 L64 16" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
                      </svg>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      Stable
                    </span>
                  </div>
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
                  {symptoms.map((symptom, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${symptom.iconBg} flex items-center justify-center`}>
                          <symptom.icon className={`h-4 w-4 ${symptom.iconColor}`} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{symptom.title}</p>
                          <p className="text-sm text-muted-foreground">Reported: {symptom.time}</p>
                        </div>
                      </div>
                      <StatusBadge variant={
                        symptom.type === "severe" ? "emergency" :
                        symptom.type === "moderate" ? "high-risk" : "normal"
                      }>
                        {symptom.type}
                      </StatusBadge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
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
