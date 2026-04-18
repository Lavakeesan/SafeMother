import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Calendar, AlertTriangle, MessageSquare, Heart, Activity,
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
  { icon: Utensils, label: "Diet Guide", url: "https://www.youtube.com/watch?v=3GTK6MLPJ9g" },
  { icon: Baby, label: "Yoga Videos", url: "https://www.youtube.com/watch?v=lKx0sOz31C4" },
  { icon: Baby, label: "Newborn 101", url: "https://www.youtube.com/watch?v=hpgjwK_oQe0" },
  { icon: Home, label: "Home Safety", url: "https://www.youtube.com/watch?v=jxV6P5R224E" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

const cardHover = {
  hover: { 
    y: -5, 
    transition: { duration: 0.2 },
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)"
  }
};

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
  
  // SMS Modal State
  const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);
  const [smsMessage, setSMSMessage] = useState("");
  const [isSendingSMS, setIsSendingSMS] = useState(false);

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
    fetchAssignedDoctors();
  }, [navigate]);

  const [assignedDoctors, setAssignedDoctors] = useState<any[]>([]);
  const fetchAssignedDoctors = async () => {
    try {
      const resp = await fetch(`http://${window.location.hostname}:5001/api/patients/appointments`, {
        credentials: 'include'
      });
      const appointments = await resp.json();
      if (Array.isArray(appointments)) {
        const doctorMap = new Map();
        appointments.forEach((app: any) => {
          if (app.doctor) doctorMap.set(app.doctor._id, app.doctor);
        });
        setAssignedDoctors(Array.from(doctorMap.values()));
      }
    } catch (err) {
      console.error(err);
    }
  };
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
    if (patient?._id) {
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

  const handleSendSMS = async () => {
    if (!smsMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSendingSMS(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:5001/api/sms/send-to-midwife`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message: smsMessage }),
      });

      if (response.ok) {
        toast.success("Message sent to your midwife's phone", {
          description: "They will receive it as an instant SMS.",
          duration: 5000,
        });
        setIsSMSModalOpen(false);
        setSMSMessage("");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send SMS");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send SMS. Please try again later.");
    } finally {
      setIsSendingSMS(false);
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
    <div className="flex min-h-screen bg-[#f8fdfe] font-sans relative overflow-x-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-teal-200/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-sky-200/20 rounded-full blur-[120px]"
        />
      </div>

      <Sidebar 
        variant="patient" 
        userName={patient.name} 
        userRole="Patient Portal" 
      />

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex-1 p-6 md:p-10 lg:p-12 overflow-auto z-10"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            variants={itemVariants} 
            className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12"
          >
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold uppercase tracking-wider border border-teal-100/50 shadow-sm"
              >
                <Activity className="h-3 w-3" />
                Active Pregnancy Monitoring
              </motion.div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                Welcome back, <span className="text-teal-600 font-black">{patient.name}</span>
              </h1>
              <p className="text-gray-500 font-medium text-lg max-w-2xl">
                {weeksPregnant > 0 ? (
                  <>You are securely in your <span className="text-teal-600 font-bold underline decoration-teal-200 decoration-4 underline-offset-4">Week {weeksPregnant}</span> milestone.</>
                ) : (
                  <>Your maternal wellness portal is ready for today's updates.</>
                )}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl px-4 py-2 shadow-sm transition-all hover:border-teal-200">
                  <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)] animate-pulse" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Midwife</span>
                  <span className="text-sm font-bold text-gray-800">{patient.midwife_id?.user_id?.name || 'Assigned Nurse'}</span>
                </div>
                
                {assignedDoctors.length > 0 && (
                  <div className="flex items-center gap-3 bg-teal-600/5 backdrop-blur-sm border border-teal-600/10 rounded-2xl px-4 py-2 shadow-sm group">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Doctor</span>
                      <span className="text-sm font-bold text-gray-800">Dr. {assignedDoctors[0].name}</span>
                    </div>
                    <div className="h-4 w-px bg-teal-200" />
                    <Button 
                      onClick={() => navigate('/patient/chat')}
                      variant="ghost" 
                      className="h-6 text-[10px] px-2 font-black uppercase tracking-widest text-teal-600 hover:bg-teal-600 hover:text-white rounded-lg transition-all"
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Chat
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-5 w-full lg:w-auto">
              <motion.div 
                whileHover={{ y: -5 }}
                className="flex items-center gap-5 bg-white p-2 pr-6 rounded-[2rem] shadow-md border border-gray-50 flex-1 lg:flex-none"
              >
                <div className="bg-teal-500 text-white p-4 rounded-3xl shadow-lg shadow-teal-100">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-0.5">Due Date</p>
                  <p className="text-xl font-black text-teal-900 leading-none">
                    {deliveryDate ? deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}) : "PENDING"}
                  </p>
                </div>
              </motion.div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative h-16 w-16 group"
                  >
                    <div className="absolute inset-0 bg-teal-400 rounded-[1.8rem] rotate-6 opacity-20 group-hover:rotate-12 transition-transform shadow-lg" />
                    <div className="relative h-full w-full rounded-[1.5rem] overflow-hidden border-2 border-white shadow-xl bg-white">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={patient.profile_photo} alt={patient.name} className="object-cover" />
                        <AvatarFallback className="bg-teal-50 text-teal-600 font-black text-xl">
                          {patient.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 p-4 mt-2 border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2rem] bg-white/90 backdrop-blur-xl" align="end">
                  <DropdownMenuLabel className="p-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-teal-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-teal-100">
                        {patient.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-base font-black text-gray-900 leading-tight">{patient.name}</p>
                        <p className="text-xs font-semibold text-gray-400 truncate w-40">{patient.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-100 h-px mb-2" />
                  <DropdownMenuItem onClick={() => openProfileModal(false)} className="cursor-pointer gap-3 py-3 px-4 rounded-2xl transition-all focus:bg-teal-50 focus:text-teal-700 text-gray-600 font-bold mb-1">
                    <User className="h-4 w-4" />
                    <span>Clinical Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openProfileModal(true)} className="cursor-pointer gap-3 py-3 px-4 rounded-2xl transition-all focus:bg-teal-50 focus:text-teal-700 text-gray-600 font-bold mb-1">
                    <Settings className="h-4 w-4" />
                    <span>Portal Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-100 h-px mt-1 mb-2" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-3 py-4 px-4 rounded-[1.5rem] text-red-600 bg-red-50 hover:bg-red-100 focus:bg-red-100 transition-all">
                    <LogOut className="h-4 w-4" />
                    <span className="font-black uppercase tracking-widest text-xs">Secure Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>

          {/* Emergency/Action Banner — only on main overview */}
          {!isAdviceMode && !isCarePlanMode && !isAlertMode && !isReportsMode && (
            <motion.div 
              variants={itemVariants}
              className="mb-12"
            >
              {/* Instant Message Banner */}
              <motion.div 
                whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(20,184,166,0.15)" }}
                className="relative overflow-hidden bg-white rounded-[2.5rem] p-1 border border-teal-50 shadow-xl shadow-teal-900/5 group"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -mr-20 -mt-20 transition-transform group-hover:scale-110" />
                
                <div className="relative flex flex-col md:flex-row items-center gap-8 p-8 md:p-10">
                  <div className="w-20 h-20 rounded-[2rem] bg-teal-500 flex items-center justify-center shrink-0 shadow-lg shadow-teal-200 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <Send className="h-10 w-10 text-white" />
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-1">
                      Direct Communication
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">Instant SMS Messenger</h3>
                    <p className="text-gray-500 font-medium text-base max-w-xl">
                      Need quick advice? Send a direct text message to your <span className="text-teal-600 font-bold">assigned midwifes phone</span> for immediate clinical guidance.
                    </p>
                  </div>
                  <div className="w-full md:w-auto">
                    <Button 
                      onClick={() => setIsSMSModalOpen(true)}
                      className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white font-black h-14 px-10 gap-3 rounded-[1.5rem] shadow-xl shadow-teal-200 hover:-translate-y-1 transition-all active:scale-95"
                    >
                      <MessageSquare className="h-5 w-5" />
                      SEND INSTANT MESSAGE
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {isAlertMode ? (
            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8 pb-12">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-50 rounded-2xl">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900">Medical Notifications</h3>
                </div>
                <p className="text-gray-500 font-medium text-lg max-w-2xl">
                  Important clinical instructions and status updates from your care providers.
                </p>
              </div>

              {/* Alert History Section */}
              <div className="space-y-4">
                {patientAlerts.length > 0 ? (
                  patientAlerts.map((alert, idx) => {
                    const isPatientSender = alert.sender === 'Patient';
                    return (
                      <motion.div 
                        key={alert._id} 
                        variants={itemVariants}
                        className={`p-6 rounded-[2rem] border-2 shadow-sm flex flex-col max-w-4xl group transition-all hover:shadow-md ${
                          isPatientSender 
                            ? 'bg-amber-50 border-amber-100 self-end ml-12' 
                            : 'bg-white border-gray-100 self-start mr-12'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                              isPatientSender ? 'bg-amber-100 text-amber-600' : 'bg-teal-100 text-teal-600'
                            }`}>
                              {isPatientSender ? "P" : "M"}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900 leading-none">
                                {isPatientSender ? "My Message" : "Clinical Midwife"}
                              </p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                {new Date(alert.alertDate).toLocaleDateString()} at {new Date(alert.alertDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          {!isPatientSender && (
                            <div className="px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-100 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                              Priority
                            </div>
                          )}
                        </div>
                        <div className="pl-13 space-y-2">
                          <p className="text-gray-700 font-bold text-base leading-relaxed whitespace-pre-wrap">
                            {alert.message.replace('EMERGENCY: ', '')}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-24 bg-gray-50 border-2 border-dashed border-gray-100 rounded-[3rem]">
                    <Bell className="h-16 w-16 mx-auto mb-4 text-gray-200" />
                    <p className="text-lg font-black text-gray-400 uppercase tracking-widest">No Message History</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : isAdviceMode ? (
            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-10 pb-12">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal-50 rounded-2xl">
                    <MessageSquare className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900">Clinical Support Library</h3>
                </div>
                <p className="text-gray-500 font-medium text-lg max-w-2xl">
                  Personalized advice and peer-reviewed references to guide your pregnancy journey.
                </p>
              </div>

              {/* Expanded Advice Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    category: "Nutrition",
                    icon: Utensils,
                    color: "text-emerald-600",
                    bg: "bg-white border-emerald-100",
                    accent: "bg-emerald-50",
                    title: "Iron-Rich Foods for Energy",
                    description: "Increasing spinach, lentils, and lean proteins will help combat fatigue. Pair with Vitamin C for max absorption.",
                    reference: "WHO Maternal Care, 2024",
                  },
                  {
                    category: "Movement",
                    icon: Activity,
                    color: "text-blue-600",
                    bg: "bg-white border-blue-100",
                    accent: "bg-blue-50",
                    title: "Pelvic Floor Routine",
                    description: "Practice Kegel exercises 3 times daily to strengthen supporting muscles and improve labor outcomes.",
                    reference: "Royal College of Midwives",
                  },
                  {
                    category: "Prep",
                    icon: Home,
                    color: "text-purple-600",
                    bg: "bg-white border-purple-100",
                    accent: "bg-purple-50",
                    title: "Choosing your Partner",
                    description: "Discuss your birth plan clearly with your partner. Practice breathing techniques together daily.",
                    reference: "NICE Guidelines CG190",
                  },
                  {
                    category: "Rest",
                    icon: Heart,
                    color: "text-rose-600",
                    bg: "bg-white border-rose-100",
                    accent: "bg-rose-50",
                    title: "Optimal Sleep Position",
                    description: "Sleep on your LEFT side after 28 weeks. This improves blood flow to the placenta and your kidneys.",
                    reference: "Tommy's Charity, 2024",
                  },
                  {
                    category: "Mindset",
                    icon: BookOpen,
                    color: "text-amber-600",
                    bg: "bg-white border-amber-100",
                    accent: "bg-amber-50",
                    title: "Daily Mindfulness",
                    description: "Spend 10 minutes on breathing exercises. Reduces cortisol and leads to calmer baby development.",
                    reference: "UK Mental Health Trust",
                  },
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                    className={`rounded-[2.5rem] border-2 p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-gray-200/50 ${item.bg}`}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`p-2 rounded-xl ${item.accent}`}>
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.category}</span>
                    </div>
                    <h4 className="text-xl font-black text-gray-900 mb-3">{item.title}</h4>
                    <p className="text-gray-500 font-bold text-sm leading-relaxed mb-6 italic">{item.description}</p>
                    <div className="pt-4 border-t border-gray-50 flex items-center gap-2">
                       <BookOpen className="h-3 w-3 text-gray-300" />
                       <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Ref: {item.reference}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : isCarePlanMode ? (
            <motion.div initial="hidden" animate="visible" variants={itemVariants} className="space-y-8 pb-12">
              <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-xl shadow-gray-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                
                <div className="relative">
                  <div className="flex items-center gap-4 mb-10 border-b border-gray-50 pb-6">
                    <div className="p-4 bg-teal-500 text-white rounded-3xl shadow-lg shadow-teal-100">
                      <BookOpen className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-gray-900 leading-tight">Clinical Care Plan</h3>
                      <p className="text-gray-400 font-semibold uppercase tracking-widest text-[10px] mt-1">Official Medical Roadmap</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <motion.div variants={itemVariants} className="space-y-4">
                        <h4 className="text-lg font-black text-teal-600 flex items-center gap-2">
                           <Activity className="h-5 w-5" />
                           Clinical Pathway
                        </h4>
                        <div className="bg-teal-50/50 p-6 rounded-[2rem] border border-teal-100/50 shadow-inner">
                          <p className="text-gray-800 font-bold text-lg leading-relaxed">
                            {patient.risk_level === 'High' ? 'High-Risk Maternal Pathway (Frequent Monitoring)' : 'Standard Routine Maternal Pathway'}
                          </p>
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="space-y-4">
                        <h4 className="text-lg font-black text-emerald-600 flex items-center gap-2">
                          <Utensils className="h-5 w-5" />
                          Nutrition Support
                        </h4>
                        <ul className="space-y-4">
                          {[
                            "Diet rich in iron, calcium, and folic acid.",
                            "Minimum 10 glasses of mineral water daily.",
                            "Strict avoidance of unpasteurized clinical hazards."
                          ].map((text, i) => (
                            <li key={i} className="flex items-start gap-4 p-4 bg-emerald-50/20 rounded-2xl border border-emerald-50 group hover:border-emerald-200 transition-colors">
                              <div className="h-2 w-2 rounded-full bg-emerald-400 mt-2 shrink-0 group-hover:scale-150 transition-transform" />
                              <p className="text-gray-600 font-bold text-sm leading-relaxed">{text}</p>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    </div>

                    <div className="space-y-8">
                      <motion.div variants={itemVariants} className="space-y-4">
                        <h4 className="text-lg font-black text-rose-600 flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          Critical Observations
                        </h4>
                        <ul className="space-y-4">
                          <li className="flex items-center gap-4 p-5 bg-rose-50/30 rounded-[1.5rem] border border-rose-100/50 translate-x-2">
                            <Heart className="h-6 w-6 text-rose-500" />
                            <p className="text-gray-700 font-bold text-sm">Vital tracking every 14 days.</p>
                          </li>
                          <li className="flex items-center gap-4 p-5 bg-blue-50/30 rounded-[1.5rem] border border-blue-100/50">
                            <Baby className="h-6 w-6 text-blue-500" />
                            <p className="text-gray-700 font-bold text-sm">Fetal kick count: 10/2hrs.</p>
                          </li>
                        </ul>
                      </motion.div>

                      <motion.div variants={itemVariants} className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-full bg-teal-500/10 group-hover:bg-teal-500 transition-colors" />
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                          <MessageSquare className="h-4 w-4" /> 
                          Clinical Review Notes
                        </h4>
                        <p className="text-gray-600 font-bold text-base italic leading-relaxed">
                          "{patient.medical_history || 'SafeMother standard protocols active. Maintain light movement routines.'}"
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : isReportsMode ? (
            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-10 pb-12">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white rounded-3xl border border-gray-100 shadow-lg text-teal-600">
                    <FileText className="h-10 w-10" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">Clinical Reports</h2>
                    <p className="text-gray-400 font-bold text-lg">Your medical journey documented by Safemother experts.</p>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {reports.length > 0 ? reports.map((rep, index) => {
                  const clinicNumber = reports.length - index;
                  return (
                    <motion.div 
                      key={rep._id} 
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      className="bg-white border-2 border-gray-50 rounded-[3rem] p-8 shadow-xl shadow-gray-200/50 flex flex-col gap-8 relative overflow-hidden group"
                    >
                      {/* Clinic Visit Badge */}
                      <div className="absolute top-0 right-0 bg-teal-500 text-white px-6 py-3 rounded-bl-[2rem] font-black text-sm uppercase tracking-widest shadow-lg shadow-teal-100 transition-transform group-hover:scale-105">
                        VISIT #{clinicNumber}
                      </div>
                      
                      {rep.report_photo ? (
                        <div 
                          className="w-full h-[400px] bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100 overflow-hidden cursor-zoom-in group/img relative"
                          onClick={() => {
                            const newTab = window.open();
                            if (newTab) {
                              newTab.document.body.innerHTML = `<img src="${rep.report_photo}" style="max-width:100%; height:auto; display:block; margin:auto; padding: 2rem;" />`;
                            }
                          }}
                        >
                          {rep.report_photo.includes("application/pdf") ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-xl font-black text-gray-300">
                              <FileText className="h-20 w-20 mb-4 opacity-20" />
                              VIEW DOCUMENT
                            </div>
                          ) : (
                            <img src={rep.report_photo} className="w-full h-full object-contain p-6 grayscale-[0.2] transition-all group-hover/img:grayscale-0 group-hover/img:scale-105" />
                          )}
                          <div className="absolute inset-0 bg-teal-600/0 group-hover/img:bg-teal-600/5 transition-colors" />
                        </div>
                      ) : (
                        <div className="w-full h-40 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center text-xs font-black text-gray-300 uppercase tracking-widest">Digital Entry Only</div>
                      )}
                      
                      <div className="space-y-6">
                        <div className="flex justify-between items-end border-b border-gray-50 pb-4">
                          <div className="space-y-1">
                            <span className="text-2xl font-black text-gray-900">Clinic Summary</span>
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-teal-600" />
                              <span className="text-xs font-bold text-gray-400 capitalize">{rep.midwife?.name || 'Care Team'}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Observation Date</p>
                            <span className="text-sm font-black text-gray-900">{new Date(rep.report_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: "Weight", val: `${rep.weight}kg`, color: "teal" },
                            { label: "Blood Pressure", val: rep.blood_pressure, color: "rose" },
                            { label: "Glucose", val: rep.sugar_level, color: "amber" },
                            { label: "BMI Indices", val: rep.bmi, color: "blue" }
                          ].map((stat, i) => (
                            <div key={i} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50 group/stat hover:bg-white hover:border-teal-100 transition-all shadow-sm">
                              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                              <p className="font-black text-lg text-gray-900 group-hover:text-teal-600 transition-colors">{stat.val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                }) : (
                  <div className="text-center py-32 bg-gray-50/50 border-4 border-dashed border-gray-100 rounded-[4rem] lg:col-span-2">
                    <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200/50 border border-gray-100 opacity-20">
                      <FileText className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-xl font-black text-gray-400 uppercase tracking-widest">No Reports Archived</p>
                    <p className="text-gray-300 font-bold mt-2">Clinical visit data will appear here after your next session.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
              <motion.div 
                variants={itemVariants}
                whileHover="hover"
                className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-xl shadow-gray-200/50 group"
              >
                <div className="grid md:grid-cols-2">
                  <div className="relative h-64 md:h-auto overflow-hidden">
                    <img 
                      src={clinicRoom} 
                      alt="Clinic room" 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-900/40 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-90">Live Tracking</span>
                      </div>
                      <h4 className="text-xl font-black">Pre-delivery Center</h4>
                    </div>
                  </div>
                  
                  <div className="p-8 sm:p-10 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-6">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-gray-900 leading-tight">Delivery Countdown</h3>
                        <p className="text-gray-400 font-semibold text-sm">Days until your little one arrives</p>
                      </div>
                      <div className="h-12 w-12 rounded-2xl bg-teal-50 flex items-center justify-center">
                        <Baby className="h-6 w-6 text-teal-600" />
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-2 mb-8">
                      {[
                        { val: cdWeeks, label: "WKS" },
                        { val: cdDays, label: "DAYS" },
                        { val: cdHours, label: "HRS" },
                        { val: cdMinutes, label: "MIN" },
                        { val: cdSeconds, label: "SEC" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center p-2 rounded-2xl bg-teal-50/50 border border-teal-100/50">
                          <p className="text-xl font-black text-teal-700">{item.val}</p>
                          <p className="text-[8px] font-black text-teal-500 uppercase tracking-tighter">{item.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-xl">
                          <Calendar className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-sm font-bold text-gray-500">
                          EDD: <span className="text-gray-900">{deliveryDate ? deliveryDate.toLocaleDateString() : "Not Set"}</span>
                        </p>
                      </div>
                      <Button variant="ghost" className="text-teal-600 font-bold text-xs hover:bg-teal-50 rounded-xl">
                        View Plan
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                whileHover="hover"
                className="bg-white rounded-[2.5rem] border border-gray-100 p-8 sm:p-10 shadow-xl shadow-gray-200/50"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-gray-900">Your Care Journey</h3>
                    <p className="text-gray-400 font-semibold text-sm">Tracking your pregnancy milestones</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-teal-600">{journeyPercentage}%</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Completed</span>
                  </div>
                </div>

                <div className="relative mb-10">
                  <div className="h-4 bg-gray-50 rounded-full overflow-hidden p-1 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${journeyPercentage}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full shadow-lg shadow-teal-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {["Conception", "1st Trim.", "2nd Trim.", "3rd Trim.", "Birth"].map((stage, i) => (
                    <div key={stage} className="flex flex-col items-center gap-3">
                      <div className={`h-3 w-3 rounded-full border-2 transition-all duration-500 ${
                        i <= currentStageIndex 
                          ? "bg-teal-500 border-teal-200 scale-125 shadow-[0_0_10px_rgba(20,184,166,0.5)]" 
                          : "bg-white border-gray-200"
                      }`} />
                      <span className={`text-[10px] text-center font-black uppercase tracking-tighter ${
                        i === currentStageIndex ? "text-teal-600" : "text-gray-400"
                      }`}>
                        {stage}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Side Column */}
            <div className="space-y-8">
              {/* Midwife Alerts Card */}
              <motion.div 
                variants={itemVariants}
                className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-200/50"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-gray-900">Midwife Alerts</h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-teal-50 rounded-full text-[10px] font-black text-teal-600 uppercase tracking-widest border border-teal-100">
                    <span className="relative flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                    </span>
                    Live
                  </div>
                </div>

                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                  {patientAlerts.length > 0 ? (
                    patientAlerts.slice(0, 5).map((alert, i) => (
                      <motion.div 
                        key={alert._id || i} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-4 rounded-2xl border-2 transition-all group ${
                          alert.status === 'Resolved' 
                            ? 'bg-gray-50 border-gray-100 opacity-60' 
                            : 'bg-teal-50/30 border-teal-100/50 shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                           <p className="text-[10px] text-teal-600 font-extrabold uppercase tracking-widest">
                             {alert.alertType}
                           </p>
                           <span className="text-[10px] text-gray-400 font-bold bg-white px-2 py-0.5 rounded-lg border border-gray-50">
                             {new Date(alert.alertDate).toLocaleDateString()}
                           </span>
                        </div>
                        <p className="font-bold text-gray-800 text-sm leading-snug mb-2 group-hover:text-teal-700 transition-colors">{alert.message}</p>
                        <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                           <div className="h-1 w-1 rounded-full bg-teal-500" />
                           <p className="text-[10px] text-gray-500 font-black italic">
                             Clinician: {patient.midwife_id?.user_id?.name || "System"}
                           </p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-[2rem]">
                      <Bell className="h-10 w-10 mx-auto mb-4 text-gray-200" />
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No Active Alerts</p>
                    </div>
                  )}
                </div>

                <Button 
                  variant="ghost" 
                  className="w-full mt-6 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest gap-2 text-teal-600 bg-teal-50/50 hover:bg-teal-600 hover:text-white transition-all" 
                  onClick={() => navigate('/patient/alert')}
                >
                  <MessageSquare className="h-4 w-4" />
                  View All Alerts
                </Button>
              </motion.div>

              {/* Essential Resources Grid */}
              <motion.div 
                variants={itemVariants}
                className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-200/50"
              >
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="h-5 w-5 text-teal-600" />
                  <h3 className="text-xl font-black text-gray-900">Patient Resources</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {resources.map((resource, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => resource.url && window.open(resource.url, '_blank')}
                      className="flex flex-col items-center gap-3 p-5 bg-teal-50/30 rounded-[1.5rem] border border-teal-100/30 hover:bg-teal-50 hover:border-teal-200 transition-all text-center group"
                    >
                      <div className="p-3 bg-white rounded-2xl shadow-sm text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                        <resource.icon className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-black text-gray-700 uppercase tracking-tighter">{resource.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Latest Vitals - High Contrast Premium Card */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden bg-gray-900 text-white rounded-[2.5rem] p-8 shadow-2xl shadow-gray-400/50"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl -ml-12 -mb-12" />

                <div className="relative">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-rose-400 mb-6 border border-white/5">
                    <Activity className="h-3 w-3" />
                    Latest Vitals
                  </div>
                  
                  <div className="flex items-center gap-6 mb-6">
                    <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/10 shadow-inner">
                      <Heart className="h-8 w-8 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-4xl font-black tracking-tighter">118/75</p>
                      <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mt-1 italic">Blood Pressure • Healthy</p>
                    </div>
                  </div>
                  
                  <blockquote className="text-base font-medium text-gray-300 italic leading-relaxed pl-4 border-l-2 border-teal-500/30">
                    "Consistent excellent readings. Maintain your current hydration and light movement."
                  </blockquote>
                </div>
              </motion.div>
            </div>
          </div>
          )}
        </div>
      </motion.div>

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
      {/* SMS Message Modal */}
      <Dialog open={isSMSModalOpen} onOpenChange={setIsSMSModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Send Message to Midwife</DialogTitle>
            <DialogDescription>Your message will be sent instantly to your midwife's phone via SMS.</DialogDescription>
          </DialogHeader>
          <div className="bg-primary p-6 text-white text-center pb-8">
            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/30">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-black">Instant Messenger</h2>
            <p className="text-white/80 text-sm">Send a direct SMS to {patient.midwife_id?.user_id?.name || 'your midwife'}</p>
          </div>
          <div className="p-8 space-y-5 bg-background">
             <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Your Message</Label>
                <Textarea
                  placeholder="Type your message here..."
                  className="min-h-[150px] bg-muted/30 border-none rounded-2xl p-4 focus-visible:ring-primary text-foreground font-medium"
                  value={smsMessage}
                  onChange={(e) => setSMSMessage(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground italic px-1 pt-1">
                  Note: This message is sent instantly via SMS gateway and is not stored in our database records.
                </p>
             </div>
             <div className="flex gap-4 pt-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsSMSModalOpen(false)}
                  className="flex-1 h-12 rounded-2xl font-bold"
                  disabled={isSendingSMS}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendSMS}
                  disabled={isSendingSMS}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl h-12 shadow-lg shadow-primary/20 gap-2"
                >
                  {isSendingSMS ? "Sending..." : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Instant SMS
                    </>
                  )}
                </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
