import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Calendar, AlertTriangle, MessageSquare, Heart, 
  Utensils, Baby, Home, BookOpen, Send
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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
  const [patient, setPatient] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [now, setNow] = useState(new Date());
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isCarePlanMode = location.pathname.includes('/care-plan');
  const isAdviceMode = location.pathname.includes('/advice');
  const isAlertMode = location.pathname.includes('/alert');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userInfo);
    setUser(parsedUser);

    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://${window.location.hostname}:5001/api/patients/profile`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setPatient(data);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleSendEmergencyMessage = async () => {
    if (!emergencyMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:5001/api/alerts/emergency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message: emergencyMessage }),
      });

      if (response.ok) {
        toast.success("Emergency message sent to your midwife team", {
          description: "A clinician will contact you shortly via email and SMS.",
          duration: 5000,
        });
        setIsEmergencyModalOpen(false);
        setEmergencyMessage("");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send alert");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send message. Please try calling triage instead.");
    } finally {
      setIsSending(false);
    }
  };

  if (!patient) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading your profile...</div>;
  }

  // Calculate generic weeks pregnant and countdown elements
  const deliveryDate = patient.delivery_date ? new Date(patient.delivery_date) : null;
  const today = new Date();
  let weeksPregnant = 0;
  
  let cdWeeks = "00";
  let cdDays = "00";
  let cdHours = "00";
  let cdMinutes = "00";
  let cdSeconds = "00";

  if (deliveryDate) {
    const msDiff = deliveryDate.getTime() - today.getTime();
    if (msDiff > 0) {
      const daysUntilDelivery = Math.floor(msDiff / (1000 * 60 * 60 * 24));
      weeksPregnant = 40 - Math.floor(daysUntilDelivery / 7);
    }
    
    const liveMsDiff = deliveryDate.getTime() - now.getTime();
    if (liveMsDiff > 0) {
      const liveDaysUntilDelivery = Math.floor(liveMsDiff / (1000 * 60 * 60 * 24));
      const totalHours = Math.floor(liveMsDiff / (1000 * 60 * 60));
      const totalMinutes = Math.floor(liveMsDiff / (1000 * 60));
      const totalSeconds = Math.floor(liveMsDiff / 1000);

      const displayWeeks = Math.floor(liveDaysUntilDelivery / 7);
      const displayDays = liveDaysUntilDelivery % 7;
      const displayHours = totalHours % 24;
      const displayMinutes = totalMinutes % 60;
      const displaySeconds = totalSeconds % 60;

      cdWeeks = displayWeeks.toString().padStart(2, '0');
      cdDays = displayDays.toString().padStart(2, '0');
      cdHours = displayHours.toString().padStart(2, '0');
      cdMinutes = displayMinutes.toString().padStart(2, '0');
      cdSeconds = displaySeconds.toString().padStart(2, '0');
    }
  }

  const journeyPercentage = Math.min(100, Math.max(0, Math.round((weeksPregnant / 40) * 100)));
  let currentStageIndex = 0;
  if (weeksPregnant >= 40) currentStageIndex = 4;
  else if (weeksPregnant >= 27) currentStageIndex = 3;
  else if (weeksPregnant >= 13) currentStageIndex = 2;
  else if (weeksPregnant > 0) currentStageIndex = 1;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        variant="patient" 
        userName={patient.name} 
        userRole="Patient Portal" 
      />

      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome back, {patient.name.split(' ')[0]}</h1>
              <p className="text-muted-foreground mt-1">
                {weeksPregnant > 0 ? (
                  <>You are currently in <span className="text-primary font-semibold">Week {weeksPregnant}</span> of your pregnancy.</>
                ) : (
                  <>Welcome to your SafeMother Maternal Portal.</>
                )}
              </p>
              <p className="text-muted-foreground mt-2 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Primary Clinical Team: <span className="font-semibold text-foreground">{patient.midwife_id?.user_id?.name || 'Not Assigned'}</span>
              </p>
            </div>

            <div className="text-right bg-card border rounded-xl px-6 py-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Due Date</p>
              <p className="text-xl font-bold text-foreground">
                {deliveryDate ? deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}) : "Not set"}
              </p>
            </div>
          </div>

          {/* Emergency Banner — only on main overview */}
          {!isAdviceMode && !isCarePlanMode && !isAlertMode && (
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
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setIsEmergencyModalOpen(true)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-2 border-emergency/50 bg-background text-emergency shadow-sm hover:bg-emergency/10 h-10 px-4 py-2"
                >
                  SEND MESSAGE
                </button>
                <Button className="bg-emergency hover:bg-emergency/90 text-white font-semibold">
                  CALL TRIAGE NOW
                </Button>
              </div>
            </div>
          )}

          {isAlertMode ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-6 w-6 text-emergency" />
                <h3 className="text-2xl font-bold text-foreground">Send Midwife Alert</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Use this form to send a priority message directly to your assigned midwife. For life-threatening emergencies, please call triage immediately.
              </p>
              <div className="bg-card border rounded-xl p-6 max-w-2xl shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Your Message</label>
                    <Textarea
                      placeholder="Describe your symptoms or concerns (e.g., sharp pain, heavy bleeding, reduced fetal movement...)"
                      className="min-h-[150px] border-emergency/30 focus-visible:ring-emergency"
                      value={emergencyMessage}
                      onChange={(e) => setEmergencyMessage(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      className="bg-emergency hover:bg-emergency/90 text-white gap-2 flex-1"
                      onClick={handleSendEmergencyMessage}
                      disabled={isSending}
                    >
                      {isSending ? "Sending..." : (
                        <><Send className="h-4 w-4" /> Send Alert to Midwife</>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-start gap-1.5 pt-1">
                    <Heart className="h-3 w-3 mt-0.5 text-emergency" />
                    Your message will be sent via email and SMS to your assigned clinical midwife immediately.
                  </p>
                </div>
              </div>
            </div>
          ) : isAdviceMode ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-bold text-foreground">Midwife Advice & References</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Personalised guidance from your assigned clinical midwife team. Follow these recommendations for the healthiest pregnancy possible.
              </p>

              {/* Expanded Advice Cards */}
              <div className="grid md:grid-cols-2 gap-5">
                {[
                  {
                    category: "Nutrition",
                    icon: Utensils,
                    color: "text-green-500",
                    bg: "bg-green-50 border-green-200",
                    title: "Iron-Rich Foods for Energy",
                    description: "Increasing spinach, lentils, and lean proteins will help combat third-trimester fatigue. Pair with Vitamin C sources (like orange juice) to maximize iron absorption. Avoid tea and coffee within 1 hour of eating iron-rich meals.",
                    reference: "WHO Antenatal Care Guidelines, 2022",
                  },
                  {
                    category: "Movement",
                    icon: Baby,
                    color: "text-blue-500",
                    bg: "bg-blue-50 border-blue-200",
                    title: "Pelvic Floor Exercises",
                    description: "Practice Kegel exercises 3 times daily (10 reps each). These strengthen the muscles supporting your uterus and bladder, improving labor outcomes and reducing postpartum recovery time.",
                    reference: "Royal College of Midwives, UK",
                  },
                  {
                    category: "Preparation",
                    icon: Home,
                    color: "text-purple-500",
                    bg: "bg-purple-50 border-purple-200",
                    title: "Choosing your Birth Partner",
                    description: "Start thinking about who you'd like in the room. Discuss your birth plan wishes with them clearly. Consider practicing breathing techniques together so they can guide you during labour.",
                    reference: "NICE Clinical Guideline CG190",
                  },
                  {
                    category: "Rest & Recovery",
                    icon: Heart,
                    color: "text-red-400",
                    bg: "bg-red-50 border-red-200",
                    title: "Sleep Positioning",
                    description: "After 28 weeks, sleep on your LEFT side. This improves blood flow to the placenta and kidneys. Use a pregnancy pillow between your knees to reduce hip and back pressure.",
                    reference: "Tommy's Pregnancy Charity, 2023",
                  },
                  {
                    category: "Mental Wellbeing",
                    icon: BookOpen,
                    color: "text-yellow-500",
                    bg: "bg-yellow-50 border-yellow-200",
                    title: "Antenatal Mindfulness",
                    description: "Spend 10 minutes daily on breathing exercises or guided meditation. Studies show this reduces cortisol levels and can lead to calmer labour experiences and better postnatal outcomes.",
                    reference: "Mindful Pregnancy Programme, 2021",
                  },
                ].map((item, i) => (
                  <div key={i} className={`rounded-xl border p-5 ${item.bg}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                      <span className={`text-xs font-semibold uppercase tracking-wider ${item.color}`}>{item.category}</span>
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.description}</p>
                    <p className="text-xs text-muted-foreground italic border-t pt-2 mt-2">📚 Source: {item.reference}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : isCarePlanMode ? (
            <div className="bg-card rounded-xl border p-6 mb-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <BookOpen className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-bold text-foreground">Your Clinical Care Plan</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-3">Assigned Clinical Pathway</h4>
                    <p className="text-muted-foreground bg-muted/50 p-4 rounded-lg border">
                      {patient.risk_level === 'High' ? 'High-Risk Maternal Pathway (Frequent Monitoring)' : 'Standard Routine Maternal Pathway'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-3">Diet & Nutrition Goals</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-foreground"><Utensils className="h-5 w-5 text-primary mt-0.5" /> Maintain a diet rich in iron, calcium, and folic acid.</li>
                      <li className="flex items-start gap-3 text-sm text-foreground"><Utensils className="h-5 w-5 text-primary mt-0.5" /> Drink at least 8-10 glasses of water daily for hydration.</li>
                      <li className="flex items-start gap-3 text-sm text-foreground"><Utensils className="h-5 w-5 text-primary mt-0.5" /> Avoid unpasteurized dairy and undercooked meats.</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-3">Monitoring & Observations</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-foreground"><Heart className="h-5 w-5 text-emergency mt-0.5" /> Regular blood pressure tracking every 2 weeks.</li>
                      <li className="flex items-start gap-3 text-sm text-foreground"><Baby className="h-5 w-5 text-primary mt-0.5" /> Monitor fetal kicks (aim for 10 movements in 2 hours).</li>
                    </ul>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-2"><MessageSquare className="h-4 w-4" /> Clinical Review Notes</h4>
                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                      "{patient.medical_history || 'No special historical notes. Keep up the good work and maintain your regular, light exercise routine.'}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
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
                      Countdown
                    </span>
                    <h3 className="text-xl font-bold text-foreground mb-2">Countdown to Delivery</h3>
                    <p className="text-muted-foreground mb-4">
                      Preparing for your little one's arrival
                    </p>

                    <div className="flex gap-2 mb-4">
                      <div className="text-center py-2 bg-muted rounded-lg flex-1">
                        <p className="text-xl font-bold text-primary">{cdWeeks}</p>
                        <p className="text-[10px] text-muted-foreground">WKS</p>
                      </div>
                      <div className="text-center py-2 bg-muted rounded-lg flex-1">
                        <p className="text-xl font-bold text-primary">{cdDays}</p>
                        <p className="text-[10px] text-muted-foreground">DAYS</p>
                      </div>
                      <div className="text-center py-2 bg-muted rounded-lg flex-1">
                        <p className="text-xl font-bold text-primary">{cdHours}</p>
                        <p className="text-[10px] text-muted-foreground">HRS</p>
                      </div>
                      <div className="text-center py-2 bg-muted rounded-lg flex-1">
                        <p className="text-xl font-bold text-primary">{cdMinutes}</p>
                        <p className="text-[10px] text-muted-foreground">MIN</p>
                      </div>
                      <div className="text-center py-2 bg-muted rounded-lg flex-1">
                        <p className="text-xl font-bold text-primary">{cdSeconds}</p>
                        <p className="text-[10px] text-muted-foreground">SEC</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Expected: {deliveryDate ? deliveryDate.toLocaleDateString() : "Not Set"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Care Journey */}
              <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Your Care Journey</h3>
                  <span className="text-sm text-success font-medium">{journeyPercentage}% Complete</span>
                </div>

                <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-primary transition-all duration-1000 ease-in-out" 
                    style={{ width: `${journeyPercentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  {["Conception", "1st Trimester", "2nd Trimester", "3rd Trimester", "Birth"].map((stage, i) => (
                    <span 
                      key={stage} 
                      className={i === currentStageIndex ? "text-primary font-medium" : "text-muted-foreground"}
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
                  "Your blood pressure has been consistently excellent, {patient.name.split(' ')[0]}. Keep up the hydration!"
                </p>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      <Dialog open={isEmergencyModalOpen} onOpenChange={setIsEmergencyModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emergency">
              <AlertTriangle className="h-5 w-5" />
              Send Emergency Message
            </DialogTitle>
            <DialogDescription>
              Your message will be prioritized and sent immediately to your assigned midwife: 
              <span className="font-semibold text-foreground ml-1">
                {patient.midwife_id?.user_id?.name || 'Primary Clinical Team'}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Describe your emergency or symptoms (e.g., sharp pain, heavy bleeding...)"
              className="min-h-[150px] border-emergency/20 focus-visible:ring-emergency"
              value={emergencyMessage}
              onChange={(e) => setEmergencyMessage(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5">
              <Heart className="h-3 w-3 mt-0.5 text-emergency shadow-sm" />
              If this is a life-threatening emergency, please use the "Call Triage" button instead for immediate assistance.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEmergencyModalOpen(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button 
              className="bg-emergency hover:bg-emergency/90 text-white gap-2"
              onClick={handleSendEmergencyMessage}
              disabled={isSending}
            >
              {isSending ? "Sending..." : (
                <>
                  <Send className="h-4 w-4" />
                  Send Critical Alert
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
