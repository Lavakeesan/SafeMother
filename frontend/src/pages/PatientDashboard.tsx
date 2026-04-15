import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Calendar, AlertTriangle, MessageSquare, Heart, 
  Utensils, Baby, Home, BookOpen, Send, FileText, User, LogOut, Settings, Bell, ChevronDown, Camera, Lock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const isReportsMode = location.pathname.includes('/reports');

  const [reports, setReports] = useState<any[]>([]);
  const [isReportsLoading, setIsReportsLoading] = useState(false);

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: "",
    email: "",
    address: "",
    contact_number: "",
    profile_photo: "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Password State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

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
  const [patientAlerts, setPatientAlerts] = useState<any[]>([]);

  const fetchPatientAlerts = async (patientId: string) => {
    try {
      const response = await fetch(`http://${window.location.hostname}:5001/api/alerts/patient/${patientId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        const sortedData = data.sort((a: any, b: any) => new Date(b.alertDate).getTime() - new Date(a.alertDate).getTime());
        setPatientAlerts(sortedData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (patient?._id && isAlertMode) {
      fetchPatientAlerts(patient._id);
    }
    if (isReportsMode) {
      fetchReports();
    }
  }, [patient?._id, isAlertMode, isReportsMode]);

  const fetchReports = async () => {
    setIsReportsLoading(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:5001/api/clinical-reports/my-reports`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReportsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:5001/api/patients/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(profileFormData)
      });
      if (response.ok) {
        const updated = await response.json();
        setPatient(updated);
        toast.success("Profile updated successfully");
        setIsProfileModalOpen(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const openProfileModal = (edit: boolean = false) => {
    setIsEditMode(edit);
    setProfileFormData({
      name: patient?.name || "",
      email: patient?.email || "",
      address: patient?.address || "",
      contact_number: patient?.contact_number || "",
      profile_photo: patient?.profile_photo || "",
    });
    setIsProfileModalOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileFormData(prev => ({ ...prev, profile_photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:5001/api/users/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Password updated successfully");
        setIsPasswordModalOpen(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

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
          description: "A clinician will contact you shortly via email.",
          duration: 5000,
        });
        setIsEmergencyModalOpen(false);
        setEmergencyMessage("");
        if (patient?._id) fetchPatientAlerts(patient._id);
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

            <div className="flex items-center gap-4 mt-2 sm:mt-0">
              {/* Delivery Date block */}
              <div className="text-right bg-primary/5 border border-primary/20 rounded-xl px-5 py-3 flex items-center gap-4">
                <div className="bg-primary/20 p-2 rounded-full hidden sm:block">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-primary uppercase tracking-wider font-bold">Delivery Date</p>
                  <p className="text-lg font-black text-foreground">
                    {deliveryDate ? deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}) : "N/A"}
                  </p>
                </div>
              </div>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0 border border-primary/10 hover:bg-primary/5 focus-visible:ring-primary focus-visible:ring-offset-2 overflow-hidden">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={patient.profile_photo} alt={patient.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                        {patient.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2 mr-4 mt-1 border border-primary/10 shadow-xl rounded-xl" align="end">
                  <DropdownMenuLabel className="p-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold text-foreground leading-none">{patient.name}</p>
                      <p className="text-xs font-medium text-muted-foreground leading-none mt-1">{patient.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-primary/5" />
                  <DropdownMenuItem onClick={() => openProfileModal(false)} className="cursor-pointer gap-2 py-2.5 rounded-lg hover:bg-primary/5">
                    <User className="h-4 w-4 text-primary" />
                    <span>View Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openProfileModal(true)} className="cursor-pointer gap-2 py-2.5 rounded-lg hover:bg-primary/5">
                    <Settings className="h-4 w-4 text-primary" />
                    <span>Edit Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-primary/5" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 py-2.5 rounded-lg text-emergency bg-emergency/5 hover:bg-emergency/10 focus:bg-emergency/10 focus:text-emergency">
                    <LogOut className="h-4 w-4" />
                    <span className="font-bold">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Emergency Banner — only on main overview */}
          {!isAdviceMode && !isCarePlanMode && !isAlertMode && !isReportsMode && (
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
                <h3 className="text-2xl font-bold text-foreground">Medical Alerts & History</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                View instructions, prescriptions, and warnings sent securely to you by your clinical team.
              </p>

              {/* Alert History Section */}
              <div className="mt-4">
                <div className="space-y-3">
                  {patientAlerts.length > 0 ? (
                    patientAlerts.map((alert) => {
                      const isPatientSender = alert.sender === 'Patient';
                      const borderClass = isPatientSender ? 'border-emergency/30 bg-emergency/5' : 'border-primary/30 bg-primary/5';
                      const badgeBg = isPatientSender ? 'bg-emergency/10 text-emergency' : 'bg-primary/10 text-primary';
                      return (
                        <div key={alert._id} className={`p-4 rounded-xl border ${borderClass} flex flex-col max-w-3xl`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${badgeBg}`}>
                                {isPatientSender ? "Me" : "Midwife"}
                              </span>
                              {!isPatientSender && <span className="font-semibold text-foreground">Clinical Team</span>}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(alert.alertDate).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-foreground whitespace-pre-wrap">{alert.message.replace('EMERGENCY: ', '')}</p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center p-8 bg-muted/20 border border-dashed rounded-xl max-w-3xl text-muted-foreground">
                      No messages yet.
                    </div>
                  )}
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
          ) : isReportsMode ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b pb-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold text-foreground">My Clinical Reports</h2>
                  <p className="text-muted-foreground text-sm">Review your clinical visit summaries and medical records.</p>
                </div>
              </div>

              <div className="space-y-6">
                {reports.length > 0 ? reports.map((rep, index) => {
                  const clinicNumber = reports.length - index;
                  return (
                    <div key={rep._id} className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col gap-6 relative overflow-hidden">
                      {/* Clinic Visit Badge */}
                      <div className="absolute top-0 right-0 bg-primary/20 text-primary px-4 py-2 rounded-bl-2xl font-black text-lg">
                        Clinic Visit #{clinicNumber}
                      </div>
                      
                      {rep.report_photo ? (
                        <div 
                          className="w-full h-[600px] bg-black/5 rounded-xl border-2 border-primary/10 overflow-hidden cursor-pointer transition-transform hover:scale-[1.01] hover:shadow-lg relative mt-2"
                          onClick={() => {
                            const newTab = window.open();
                            if (newTab) {
                              newTab.document.body.innerHTML = `<img src="${rep.report_photo}" style="max-width:100%; height:auto; display:block; margin:auto;" />`;
                            }
                          }}
                          title="Click to enlarge"
                        >
                          {rep.report_photo.includes("application/pdf") ? <div className="w-full h-full flex items-center justify-center text-xl font-semibold text-muted-foreground bg-muted/30">📄 View PDF Document</div> : <img src={rep.report_photo} className="w-full h-full object-contain drop-shadow-sm" />}
                        </div>
                      ) : (
                        <div className="w-full h-64 bg-muted/30 rounded-xl border-2 border-dashed flex items-center justify-center text-sm font-medium text-muted-foreground">Report image placeholder</div>
                      )}
                      
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-4 border-b border-primary/10 pb-3">
                          <div className="truncate">
                            <span className="font-bold text-2xl text-primary">Clinic Summary</span>
                            <span className="ml-2 text-md text-muted-foreground">by {rep.midwife?.name || 'Assigned Midwife'}</span>
                          </div>
                          <span className="text-sm font-bold text-muted-foreground shrink-0">{new Date(rep.report_date).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-primary/5 rounded-xl border border-primary/10 px-5 py-4">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">Weight</p>
                            <p className="font-black text-2xl text-foreground">{rep.weight} kg</p>
                          </div>
                          <div className="bg-primary/5 rounded-xl border border-primary/10 px-5 py-4">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">BP</p>
                            <p className="font-black text-2xl text-foreground">{rep.blood_pressure}</p>
                          </div>
                          <div className="bg-primary/5 rounded-xl border border-primary/10 px-5 py-4">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">Sugar</p>
                            <p className="font-black text-2xl text-foreground truncate">{rep.sugar_level}</p>
                          </div>
                          <div className="bg-primary/5 rounded-xl border border-primary/10 px-5 py-4">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">BMI</p>
                            <p className="font-black text-2xl text-foreground">{rep.bmi}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-20 bg-muted/20 border border-dashed rounded-2xl text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No clinical reports found</p>
                    <p className="text-sm">Your midwife has not uploaded any reports yet.</p>
                  </div>
                )}
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

      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Patient Profile - {isEditMode ? "Edit Mode" : "View Mode"}</DialogTitle>
            <DialogDescription>View or update your personal clinical contact details here.</DialogDescription>
          </DialogHeader>
          <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-white pb-14">
             <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="h-32 w-32 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-black border border-white/30 overflow-hidden shadow-2xl ring-4 ring-white/10">
                    {profileFormData.profile_photo || patient.profile_photo ? (
                      <img src={profileFormData.profile_photo || patient.profile_photo} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                    ) : (
                      <span>{patient.name.charAt(0)}</span>
                    )}
                  </div>
                  {isEditMode && (
                    <label className="absolute -bottom-2 -right-2 h-10 w-10 bg-white text-primary rounded-full flex items-center justify-center shadow-xl border border-primary/10 cursor-pointer hover:scale-110 transition-transform z-10">
                      <Camera className="h-5 w-5" />
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                  )}
                </div>
                <div>
                   <h2 className="text-3xl font-black mb-1">{patient.name}</h2>
                   <div className="flex items-center gap-2">
                     <span className="px-2 py-0.5 bg-white/20 rounded font-bold text-xs uppercase tracking-widest">{patient.mrn}</span>
                     <span className="text-white/70 font-medium">• Clinical Profile</span>
                   </div>
                </div>
             </div>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="bg-background px-8 pt-0 pb-8 -mt-8">
            <div className="bg-card border rounded-2xl p-8 shadow-xl space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter ml-1">Full Name</Label>
                    <Input readOnly={!isEditMode} value={profileFormData.name} onChange={e => setProfileFormData({...profileFormData, name: e.target.value})} className={!isEditMode ? "bg-muted/10 border-none px-0 shadow-none text-xl text-foreground font-black" : "bg-muted/30 h-12 text-lg font-bold"} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter ml-1">Email Address</Label>
                    <Input readOnly={!isEditMode} value={profileFormData.email} onChange={e => setProfileFormData({...profileFormData, email: e.target.value})} className={!isEditMode ? "bg-muted/10 border-none px-0 shadow-none text-xl text-foreground font-black" : "bg-muted/30 h-12 text-lg font-bold"} />
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter ml-1">Contact Number</Label>
                    <Input readOnly={!isEditMode} value={profileFormData.contact_number} onChange={e => setProfileFormData({...profileFormData, contact_number: e.target.value})} className={!isEditMode ? "bg-muted/10 border-none px-0 shadow-none text-xl text-foreground font-black" : "bg-muted/30 h-12 text-lg font-bold"} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter ml-1">Assigned Midwife</Label>
                    <div className="bg-muted/10 h-12 flex items-center px-0 text-xl font-black text-primary">
                       {patient.midwife_id?.user_id?.name || "Senior Clinician"}
                    </div>
                  </div>
               </div>

               <div className="space-y-3 pt-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter ml-1">Residential Address</Label>
                  <Input readOnly={!isEditMode} value={profileFormData.address} onChange={e => setProfileFormData({...profileFormData, address: e.target.value})} className={!isEditMode ? "bg-muted/10 border-none px-0 shadow-none text-xl text-foreground font-black" : "bg-muted/30 h-12 text-lg font-bold"} />
               </div>
               
               <div className="pt-6 border-t border-primary/10">
                  <div className="flex items-center justify-between text-xs px-2">
                     <span className="text-muted-foreground font-bold flex items-center gap-2"><Heart className="h-4 w-4 text-emergency animate-pulse" /> Verified Maternal Record</span>
                     <span className="text-muted-foreground italic truncate max-w-[300px]">Electronic Health Record ID: {patient._id}</span>
                  </div>
               </div>

               {/* Security Section */}
               <div className="pt-4 mt-2">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-3 ml-1">Account Security</p>
                  <Button 
                    type="button" 
                    onClick={() => setIsPasswordModalOpen(true)} 
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-2xl h-14 flex items-center justify-center gap-3 font-black shadow-lg shadow-amber-200 transition-all active:scale-95"
                  >
                     <Lock className="h-5 w-5" />
                     Update Account Password
                  </Button>
               </div>
            </div>
            
            <div className="flex gap-4 mt-8">
               <Button type="button" variant="outline" onClick={() => setIsProfileModalOpen(false)} className="flex-1 rounded-2xl h-12 font-bold text-base shadow-sm hover:bg-muted transition-all">
                 {isEditMode ? "Cancel Changes" : "Close Portal"}
               </Button>
               {isEditMode && (
                 <Button type="submit" disabled={isUpdatingProfile} className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-2xl h-12 font-black text-base shadow-lg shadow-primary/20 transition-all">
                   {isUpdatingProfile ? "Saving Profile..." : "Submit Updates"}
                 </Button>
               )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Change Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
           <DialogHeader className="sr-only">
              <DialogTitle>Change Account Password</DialogTitle>
              <DialogDescription>Enter your current and new passwords to update your account security.</DialogDescription>
           </DialogHeader>
           
           <div className="bg-amber-500 p-6 text-white text-center pb-8">
              <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/30">
                 <Lock className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-black">Security Settings</h2>
              <p className="text-white/80 text-sm">Update your account password</p>
           </div>
           
           <form onSubmit={handleUpdatePassword} className="p-8 space-y-5 bg-background">
              <div className="space-y-2">
                 <Label className="text-xs font-black uppercase text-muted-foreground mr-1">Current Password</Label>
                 <Input 
                   type="password" 
                   required
                   value={passwordData.currentPassword} 
                   onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} 
                   className="h-12 bg-muted/30 rounded-xl"
                   placeholder="••••••••"
                 />
              </div>
              
              <div className="space-y-2 pt-2">
                 <Label className="text-xs font-black uppercase text-muted-foreground mr-1">New Password</Label>
                 <Input 
                   type="password" 
                   required
                   value={passwordData.newPassword} 
                   onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} 
                   className="h-12 bg-muted/30 rounded-xl"
                   placeholder="Enter new password"
                 />
              </div>
              
              <div className="space-y-2">
                 <Label className="text-xs font-black uppercase text-muted-foreground mr-1">Confirm New Password</Label>
                 <Input 
                   type="password" 
                   required
                   value={passwordData.confirmPassword} 
                   onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                   className="h-12 bg-muted/30 rounded-xl"
                   placeholder="Confirm new password"
                 />
              </div>
              
              <div className="flex gap-3 pt-4">
                 <Button type="button" variant="ghost" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 rounded-xl">Cancel</Button>
                 <Button type="submit" disabled={isUpdatingPassword} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl">
                    {isUpdatingPassword ? "Updating..." : "Update Password"}
                 </Button>
              </div>
           </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
