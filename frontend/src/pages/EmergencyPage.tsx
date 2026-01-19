import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Phone, AlertTriangle, Bell, Heart, Droplets, Wind, 
  Play, Plus, ChevronRight, Settings, X
} from "lucide-react";
import { Link } from "react-router-dom";

const checklistItems = [
  "Establish 2 large-bore IV lines (16G or 18G)",
  "Start 1L Isotonic Crystalloid (LR or NS) Wide Open",
  "Draw Stat Labs: CBC, Coags, Type & Cross (4 units)",
];

export default function EmergencyPage() {
  const [currentStep, setCurrentStep] = useState(3);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState({ hours: 0, minutes: 8, seconds: 42 });

  const toggleItem = (index: number) => {
    setCheckedItems(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Emergency Header */}
      <header className="bg-emergency text-emergency-foreground px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-2xl">✱</span>
            </div>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wide">
                Postpartum Hemorrhage Detected
              </h1>
              <p className="text-sm opacity-90 uppercase tracking-wide">
                Immediate Intervention Required
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs opacity-80 uppercase tracking-wide">Elapsed Time</p>
              <div className="flex items-center gap-1 text-2xl font-mono font-bold">
                <span className="bg-emergency-foreground/20 px-2 py-1 rounded">
                  {String(elapsed.hours).padStart(2, '0')}
                </span>
                <span>:</span>
                <span className="bg-emergency-foreground/20 px-2 py-1 rounded">
                  {String(elapsed.minutes).padStart(2, '0')}
                </span>
                <span>:</span>
                <span className="bg-emergency-foreground/20 px-2 py-1 rounded">
                  {String(elapsed.seconds).padStart(2, '0')}
                </span>
              </div>
              <div className="flex gap-2 text-xs mt-1">
                <span>HRS</span>
                <span className="ml-4">MIN</span>
                <span className="ml-4">SEC</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sub Header */}
      <div className="bg-card border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-sm">📍</span>
          </div>
          <span className="font-semibold text-foreground">MaternalCare Pro</span>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <p className="font-medium text-foreground">Sarah Johnson (ID: 88291)</p>
            <p className="text-sm text-muted-foreground">38 WEEKS GESTATION • NO KNOWN ALLERGIES</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Protocol Log
            </Button>
            <Button variant="outline" size="sm">
              End Emergency
            </Button>
          </div>
        </div>
      </div>

      <main className="p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Checklist */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-foreground">Emergency Checklist</h2>
                  <p className="text-sm text-muted-foreground">Follow each step sequentially. Do not skip.</p>
                </div>
                <span className="text-primary font-bold">STEP {currentStep} OF 8</span>
              </div>

              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all" 
                  style={{ width: `${(currentStep / 8) * 100}%` }} 
                />
              </div>
            </div>

            {/* Completed Step */}
            <div className="bg-card rounded-xl border p-4 flex items-center gap-4 opacity-60">
              <div className="w-10 h-10 rounded-full bg-success text-success-foreground flex items-center justify-center">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Call for Assistance</p>
                <p className="text-sm text-muted-foreground">Activate Rapid Response Team (RRT) and notify OB/GYN on-call.</p>
              </div>
              <span className="text-sm text-muted-foreground">10:42 AM</span>
            </div>

            {/* Current Step */}
            <div className="bg-card rounded-xl border-2 border-emergency p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-emergency text-emergency-foreground flex items-center justify-center text-xl font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground uppercase">
                    Circulation: IV Access & Fluids
                  </h3>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {checklistItems.map((item, i) => (
                  <label 
                    key={i} 
                    className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  >
                    <Checkbox 
                      checked={checkedItems.includes(i)}
                      onCheckedChange={() => toggleItem(i)}
                      className="h-5 w-5"
                    />
                    <span className="text-foreground">{item}</span>
                  </label>
                ))}
              </div>

              <Button 
                className="w-full gap-2 bg-emergency hover:bg-emergency/90 text-lg py-6"
                disabled={checkedItems.length < checklistItems.length}
              >
                CONFIRM AND ADVANCE TO STEP 4
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Next Step Preview */}
            <div className="bg-card rounded-xl border p-4 flex items-center gap-4 opacity-70">
              <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold">
                4
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Administer Uterotonics</p>
                <p className="text-sm text-muted-foreground">Oxytocin 20-40 units in 1L LR or NS IV infusion.</p>
              </div>
            </div>

            {/* Communication Log */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium">COMMUNICATION LOG:</span>
              <span className="px-2 py-1 bg-muted rounded">10:41: OBGYN Alerted</span>
              <span className="px-2 py-1 bg-muted rounded">10:45: Rapid Response Arrived</span>
            </div>
          </div>

          {/* Right Column - Quick Actions & Vitals */}
          <div className="space-y-4">
            {/* Emergency Call */}
            <Button className="w-full py-6 bg-emergency hover:bg-emergency/90 text-lg gap-2">
              <Phone className="h-5 w-5" />
              CALL EMERGENCY SERVICES (911)
            </Button>

            {/* Hospital Alert */}
            <Button className="w-full py-6 bg-warning hover:bg-warning/90 text-lg gap-2 text-warning-foreground">
              <Bell className="h-5 w-5" />
              ALERT HOSPITAL (STAT)
            </Button>

            {/* Patient Vitals */}
            <div className="bg-card rounded-xl border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground uppercase text-xs tracking-wide">
                  Patient Vitals
                </h3>
                <span className="flex items-center gap-1 text-xs text-emergency">
                  <span className="w-2 h-2 rounded-full bg-emergency animate-pulse" />
                  Live Monitoring
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-emergency" />
                    <span className="text-muted-foreground">Blood Pressure</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-emergency">88/52</span>
                    <p className="text-xs text-emergency">HYPOTENSIVE</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-warning" />
                    <span className="text-muted-foreground">Heart Rate</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-warning">118</span>
                    <p className="text-xs text-warning">TACHYCARDIC</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-warning" />
                    <span className="text-muted-foreground">SpO2</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-warning">94%</span>
                    <p className="text-xs text-muted-foreground">ROOM AIR</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rapid Dosage Reference */}
            <div className="bg-foreground text-background rounded-xl p-5">
              <h3 className="font-semibold uppercase text-xs tracking-wide mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Rapid Dosage Ref
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-background/10 rounded">
                  <span>Oxytocin (IV)</span>
                  <span className="font-bold text-primary">40 Units/L</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-background/10 rounded">
                  <span>TXA (Slow IV Push)</span>
                  <span className="font-bold text-primary">1g / 10 min</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-background/20">
                <Button variant="ghost" size="sm" className="gap-1 text-primary hover:bg-background/10">
                  <Plus className="h-4 w-4" />
                  Add Note
                </Button>
                <span className="text-xs opacity-70">Session ID: #MM-882-PPH</span>
              </div>
            </div>

            {/* Reference Video */}
            <div className="bg-gradient-to-br from-foreground to-primary/80 text-background rounded-xl p-6">
              <p className="text-xs uppercase tracking-wide opacity-80 mb-2">Reference Video</p>
              <p className="font-semibold mb-4">Bimanual Compression Technique</p>
              <div className="flex justify-center">
                <button className="w-12 h-12 rounded-full bg-background/20 flex items-center justify-center hover:bg-background/30 transition-colors">
                  <Play className="h-6 w-6 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
