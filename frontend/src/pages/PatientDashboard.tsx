import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { 
  Calendar, AlertTriangle, MessageSquare, Heart, 
  Utensils, Baby, Home, BookOpen
} from "lucide-react";
import clinicRoom from "@/assets/clinic-room.png";

const advice = [
  {
    category: "Nutrition",
    date: "Today",
    title: "Iron-Rich Foods for Energy",
    description: "Increasing spinach and lean proteins can help with the fatigue you mentioned...",
    active: true,
  },
  {
    category: "Movement",
    date: "2 Days Ago",
    title: "Pelvic Floor Exercises",
    description: "Gentle movements to help prepare for your third trimester transition.",
  },
  {
    category: "Preparation",
    date: "1 Week Ago",
    title: "Choosing your Birth Partner",
    description: "Start thinking about who you'd like to have in the room with you.",
  },
];

const resources = [
  { icon: Utensils, label: "Diet Guide" },
  { icon: Baby, label: "Yoga Videos" },
  { icon: Baby, label: "Newborn 101" },
  { icon: Home, label: "Home Safety" },
];

export default function PatientDashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        variant="patient" 
        userName="Elena Rodriguez" 
        userRole="Your Midwife" 
      />

      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome back, Sarah</h1>
              <p className="text-muted-foreground mt-1">
                You are currently in <span className="text-primary font-semibold">Week 24</span> of your pregnancy. 
                Your baby is the size of a pomegranate.
              </p>
            </div>

            <div className="text-right bg-card border rounded-xl px-6 py-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Due Date</p>
              <p className="text-xl font-bold text-foreground">Feb 14, 2024</p>
            </div>
          </div>

          {/* Emergency Banner */}
          <div className="bg-emergency/5 border border-emergency/20 rounded-xl p-6 mb-8 flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-emergency/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-emergency" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-emergency">Emergency Instructions</h3>
              <p className="text-muted-foreground">
                If you experience sharp pain, heavy bleeding, or decreased movement, contact triage immediately.
              </p>
            </div>
            <Button className="bg-emergency hover:bg-emergency/90">
              CALL TRIAGE NOW
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Next Visit Card */}
              <div className="bg-card rounded-xl border overflow-hidden">
                <div className="grid md:grid-cols-2">
                  <img 
                    src={clinicRoom} 
                    alt="Clinic room" 
                    className="h-full w-full object-cover"
                  />
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full uppercase tracking-wide mb-3">
                      Next Visit
                    </span>
                    <h3 className="text-xl font-bold text-foreground mb-2">Routine Check-up</h3>
                    <p className="text-muted-foreground mb-4">
                      With Midwife Elena • St. Mary's Maternal Wing
                    </p>

                    <div className="flex gap-4 mb-4">
                      <div className="text-center px-4 py-2 bg-muted rounded-lg">
                        <p className="text-2xl font-bold text-primary">05</p>
                        <p className="text-xs text-muted-foreground">DAYS</p>
                      </div>
                      <div className="text-center px-4 py-2 bg-muted rounded-lg">
                        <p className="text-2xl font-bold text-primary">14</p>
                        <p className="text-xs text-muted-foreground">HOURS</p>
                      </div>
                      <div className="text-center px-4 py-2 bg-muted rounded-lg">
                        <p className="text-2xl font-bold text-primary">22</p>
                        <p className="text-xs text-muted-foreground">MINS</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Friday, Oct 27
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        10:00 AM
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Care Journey */}
              <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Your Care Journey</h3>
                  <span className="text-sm text-success font-medium">60% Complete</span>
                </div>

                <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-primary w-[60%]" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  {["Conception", "First Trimester", "Second Trimester", "Third Trimester", "Birth"].map((stage, i) => (
                    <span 
                      key={stage} 
                      className={i === 2 ? "text-primary font-medium" : "text-muted-foreground"}
                    >
                      {stage}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Midwife Advice */}
              <div className="bg-card rounded-xl border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Midwife Advice</h3>
                  <span className="text-primary">💡</span>
                </div>

                <div className="space-y-4">
                  {advice.map((item, i) => (
                    <div 
                      key={i} 
                      className={`p-3 rounded-lg ${item.active ? "bg-primary/5 border border-primary/20" : "bg-muted/50"}`}
                    >
                      <p className="text-xs text-primary font-medium mb-1">
                        {item.category} • {item.date}
                      </p>
                      <p className="font-medium text-foreground text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full mt-4">
                  View All Advice
                </Button>
              </div>

              {/* Essential Resources */}
              <div className="bg-card rounded-xl border p-5">
                <h3 className="font-semibold text-foreground mb-4">Essential Resources</h3>
                <div className="grid grid-cols-2 gap-3">
                  {resources.map((resource, i) => (
                    <button
                      key={i}
                      className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <resource.icon className="h-6 w-6 text-primary" />
                      <span className="text-sm text-foreground">{resource.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Latest Vitals */}
              <div className="bg-foreground text-background rounded-xl p-5">
                <p className="text-xs text-emergency uppercase tracking-wide mb-3">Latest Vitals</p>
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="h-6 w-6 text-emergency" />
                  <div>
                    <p className="text-2xl font-bold">118/75</p>
                    <p className="text-xs opacity-70">Blood Pressure • Perfect</p>
                  </div>
                </div>
                <p className="text-sm opacity-80">
                  "Your blood pressure has been consistently excellent, Sarah. Keep up the hydration!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
