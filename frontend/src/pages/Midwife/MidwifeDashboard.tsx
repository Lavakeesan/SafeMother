import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { PatientCard } from "@/components/PatientCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Users, Baby, AlertTriangle, Zap, Search, Calendar, Edit, Upload, FileText, ChevronRight, Plus, ShieldCheck } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function MidwifeDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form State - Using snake_case to match DB
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mrn: "",
    age: "",
    address: "",
    contact_number: "",
    medical_history: "",
    delivery_date: "",
    risk_level: "Low",
    user_id: "", 
  });

  // Alert State
  const location = useLocation();
  const isAlertsMode = location.pathname.includes('/calendar'); // /midwife/calendar is used for Medical Alerts
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedPatientForAlert, setSelectedPatientForAlert] = useState("");
  const [alertMessageText, setAlertMessageText] = useState("");
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  // Clinical Reports State
  const isReportsMode = location.pathname.includes('/reports');
  const [reports, setReports] = useState<any[]>([]);
  const [selectedPatientForReport, setSelectedPatientForReport] = useState("");
  const [reportWeight, setReportWeight] = useState("");
  const [reportSugar, setReportSugar] = useState("");
  const [reportBP, setReportBP] = useState("");
  const [reportBMI, setReportBMI] = useState(""); 
  const [reportPhoto, setReportPhoto] = useState<string | null>(null);
  const [isUploadingReport, setIsUploadingReport] = useState(false);
  
  const [isEmergencySMSModalOpen, setIsEmergencySMSModalOpen] = useState(false);
  const [emergencySMSMessage, setEmergencySMSMessage] = useState("");
  const [selectedPatientForSMS, setSelectedPatientForSMS] = useState<any>(null);
  const [isSendingSMS, setIsSendingSMS] = useState(false);

  // Appointment State
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedPatientForAppointment, setSelectedPatientForAppointment] = useState<any>(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentPurpose, setAppointmentPurpose] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/alerts`, {
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    }
  };

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    } else {
      navigate("/login");
    }
    fetchPatients();
    fetchDoctors();
    if (isAlertsMode) {
      fetchAlerts();
    }
    if (isReportsMode) {
      fetchReports();
    }
  }, [isAlertsMode, isReportsMode]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctor`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      }
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    }
  };

  const handleScheduleAppointment = async () => {
    if (!selectedPatientForAppointment || !selectedDoctorId || !appointmentDate || !appointmentTime) {
      return toast.error("Please fill all required fields");
    }

    setIsScheduling(true);
    try {
      // Combine date and time
      const dateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          patientId: selectedPatientForAppointment._id,
          doctorId: selectedDoctorId,
          appointmentDate: dateTime.toISOString(),
          purpose: appointmentPurpose
        })
      });

      if (response.ok) {
        toast.success("Appointment scheduled successfully");
        setIsAppointmentModalOpen(false);
        // Reset form
        setSelectedDoctorId("");
        setAppointmentDate("");
        setAppointmentTime("");
        setAppointmentPurpose("");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to schedule appointment");
      }
    } catch (err) {
      toast.error("An error occurred");
      console.error(err);
    } finally {
      setIsScheduling(false);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clinical-reports`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setReportPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadReport = async () => {
    if (!selectedPatientForReport) return toast.error("Select a patient");
    if (!reportWeight || !reportSugar || !reportBP || !reportBMI) return toast.error("Fill all medical fields");
    
    setIsUploadingReport(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/clinical-reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          patientId: selectedPatientForReport,
          weight: Number(reportWeight),
          sugar_level: reportSugar,
          blood_pressure: reportBP,
          bmi: Number(reportBMI),
          report_photo: reportPhoto
        })
      });
      if (response.ok) {
        toast.success("Report uploaded successfully!");
        setReportWeight(""); setReportSugar(""); setReportBP(""); setReportBMI(""); setReportPhoto(null); setSelectedPatientForReport("");
        fetchReports(); // Refresh 
      } else {
        toast.error("Failed to upload report");
      }
    } catch {
      toast.error("An error occurred computing request");
    } finally {
      setIsUploadingReport(false);
    }
  };

  const handleSendAlert = async () => {
    if (!selectedPatientForAlert || !alertMessageText) {
      toast.error("Please select a patient and enter an alert message");
      return;
    }
    setIsSendingAlert(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          patientId: selectedPatientForAlert,
          message: alertMessageText
        })
      });
      if (response.ok) {
        toast.success("Alert sent successfully");
        setAlertMessageText("");
        setSelectedPatientForAlert("");
        fetchAlerts();
      } else {
        toast.error("Failed to send alert");
      }
    } catch (error) {
      toast.error("An error occurred while sending alert");
    } finally {
      setIsSendingAlert(false);
    }
  };

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          age: Number(formData.age),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Patient registered successfully");
        setIsRegisterModalOpen(false);
        setFormData({
          name: "",
          email: "",
          mrn: "",
          age: "",
          address: "",
          contact_number: "",
          medical_history: "",
          delivery_date: "",
          risk_level: "Low",
          user_id: "",
        });
        fetchPatients(); // Refresh list
      } else {
        toast.error(data.message || "Failed to register patient");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmergencySMS = async () => {
    if (!selectedPatientForSMS || !emergencySMSMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSendingSMS(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/sms/send-to-patient`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          patientId: selectedPatientForSMS._id,
          message: emergencySMSMessage 
        }),
      });

      if (response.ok) {
        toast.success(`Emergency SMS sent to ${selectedPatientForSMS.name}`, {
          description: "They will receive a high-priority alert on their phone.",
          duration: 5000,
        });
        setIsEmergencySMSModalOpen(false);
        setEmergencySMSMessage("");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send SMS");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send SMS. Please check gateway connection.");
    } finally {
      setIsSendingSMS(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fdfe] font-sans relative overflow-x-hidden">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 6, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute -top-[12%] -right-[8%] w-[40%] h-[40%] bg-teal-200/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, -6, 0] }}
          transition={{ duration: 14, repeat: Infinity }}
          className="absolute bottom-[10%] -left-[10%] w-[45%] h-[45%] bg-sky-200/20 rounded-full blur-[120px]"
        />
      </div>

      <Sidebar
        variant="midwife"
        userName={user?.name || "Midwife User"}
        userRole={user?.role === 'midwife' ? 'Senior Midwife' : 'Clinical Administrator'}
      />

      <div className="flex-1 flex flex-col z-10 overflow-hidden">
        <Header
          title="Midwife Dashboard"
          subtitle="Care management for maternal health"
          showRegisterPatient
          onRegisterPatient={() => setIsRegisterModalOpen(true)}
        />

        <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-auto">
          {isAlertsMode ? (
            /* ─── ALERTS MODE ──────────────────────────────── */
            <motion.div
              initial="hidden" animate="visible" variants={containerVariants}
              className="space-y-10 max-w-4xl pb-12"
            >
              {/* Section header */}
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-red-50 rounded-3xl text-red-500 shadow-sm border border-red-100/50">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Medical Alerts</h2>
                    <p className="text-gray-400 font-medium">Send urgent prescriptions and clinical alerts to patients.</p>
                  </div>
                </div>
              </motion.div>

              {/* Send Alert Form */}
              <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-50/80 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse inline-block" />
                  Dispatch New Alert
                </h3>
                <div className="space-y-5 relative">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Patient</Label>
                    <Select value={selectedPatientForAlert} onValueChange={setSelectedPatientForAlert}>
                      <SelectTrigger className="w-full h-12 rounded-2xl border-none bg-gray-50 px-4 font-bold text-gray-700 focus:ring-teal-400">
                        <SelectValue placeholder="Search and select patient..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        {patients.map(p => (
                          <SelectItem key={p._id} value={p._id} className="rounded-xl">{p.name} — {p.mrn}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Alert Message / Prescription</Label>
                    <textarea
                      className="flex w-full rounded-2xl border-none bg-gray-50 px-4 py-3 text-sm placeholder:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 min-h-[130px] font-medium text-gray-700 resize-none"
                      placeholder="Type the exact prescription, medical advice, or alert message here..."
                      value={alertMessageText}
                      onChange={(e) => setAlertMessageText(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-black rounded-[1.5rem] shadow-lg shadow-red-100 tracking-widest text-xs uppercase gap-2 transition-all hover:-translate-y-0.5 active:scale-95"
                    onClick={handleSendAlert}
                    disabled={isSendingAlert}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    {isSendingAlert ? "Dispatching..." : "Dispatch Medical Alert"}
                  </Button>
                </div>
              </motion.div>

              {/* Alert History */}
              <motion.div variants={itemVariants} className="space-y-5">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  Alert History
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-black text-gray-400 uppercase tracking-widest">{alerts.length} Records</span>
                </h3>
                <div className="space-y-4">
                  {alerts.length > 0 ? (
                    alerts.map((alert, i) => {
                      const isPatientSender = alert.sender === 'Patient';
                      return (
                        <motion.div
                          key={alert._id}
                          variants={itemVariants}
                          className={`p-6 rounded-[2rem] border-2 shadow-sm transition-all hover:shadow-md group ${
                            isPatientSender
                              ? 'bg-amber-50 border-amber-100'
                              : 'bg-white border-gray-100'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${
                                isPatientSender ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'
                              }`}>
                                {isPatientSender ? "P" : "M"}
                              </div>
                              <div>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isPatientSender ? 'text-amber-600' : 'text-teal-600'}`}>
                                  {isPatientSender ? "From Patient" : "To Patient"}
                                </p>
                                <p className="font-black text-gray-900 text-sm">{alert.patient?.name} <span className="text-gray-400 font-bold">({alert.patient?.mrn})</span></p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                              {new Date(alert.alertDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {new Date(alert.alertDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-gray-700 leading-relaxed pl-13">{alert.message}</p>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-20 bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-[3rem]">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-200" />
                      <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Alerts Dispatched Yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>

          ) : isReportsMode ? (
            /* ─── REPORTS MODE ─────────────────────────────── */
            <motion.div
              initial="hidden" animate="visible" variants={containerVariants}
              className="space-y-10 max-w-5xl pb-12"
            >
              {/* Section Header */}
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-teal-50 rounded-3xl text-teal-600 shadow-sm border border-teal-100/50">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Clinical Reports</h2>
                    <p className="text-gray-400 font-medium">Upload clinical documents and record patient vitals.</p>
                  </div>
                </div>
              </motion.div>

              {/* Upload Form */}
              <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50/80 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
                <h3 className="text-xl font-black text-gray-900 mb-6">New Clinical Log</h3>
                <div className="grid grid-cols-2 gap-5 relative">
                  <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Patient</Label>
                    <Select value={selectedPatientForReport} onValueChange={setSelectedPatientForReport}>
                      <SelectTrigger className="w-full h-12 rounded-2xl border-none bg-gray-50 px-4 font-bold text-gray-700">
                        <SelectValue placeholder="Select patient..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        {patients.map(p => (
                          <SelectItem key={p._id} value={p._id} className="rounded-xl">{p.name} — {p.mrn}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {[
                    { label: "Weight (kg)", placeholder: "e.g. 68", value: reportWeight, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setReportWeight(e.target.value), type: "number" },
                    { label: "BMI", placeholder: "e.g. 24.5", value: reportBMI, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setReportBMI(e.target.value), type: "number" },
                    { label: "Blood Pressure", placeholder: "e.g. 120/80", value: reportBP, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setReportBP(e.target.value), type: "text" },
                    { label: "Sugar Level", placeholder: "e.g. 90 mg/dL", value: reportSugar, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setReportSugar(e.target.value), type: "text" },
                  ].map((field, i) => (
                    <div key={i} className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{field.label}</Label>
                      <Input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={field.value}
                        onChange={field.onChange}
                        className="h-12 rounded-2xl border-none bg-gray-50 px-4 font-bold text-gray-700"
                      />
                    </div>
                  ))}
                  <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Report Scan / Photo</Label>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handlePhotoUpload}
                      className="cursor-pointer h-12 rounded-2xl border-none bg-gray-50 px-4 file:text-teal-600 file:bg-teal-50 file:border-0 file:rounded-xl file:px-4 file:py-1 file:font-black hover:file:bg-teal-100 transition-all"
                    />
                    {reportPhoto && (
                      <div className="mt-3 relative w-full h-32 bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100">
                        {reportPhoto.includes("application/pdf") ? (
                          <span className="text-sm font-black text-gray-400 uppercase tracking-widest">📄 PDF Attached</span>
                        ) : (
                          <img src={reportPhoto} alt="Preview" className="h-full object-contain" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 mt-2">
                    <Button
                      className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-[1.5rem] shadow-lg shadow-teal-100 tracking-widest text-xs uppercase gap-2 transition-all hover:-translate-y-0.5 active:scale-95"
                      onClick={handleUploadReport}
                      disabled={isUploadingReport}
                    >
                      <Upload className="h-4 w-4" />
                      {isUploadingReport ? "Uploading..." : "Save Clinical Report"}
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Reports Archive */}
              <motion.div variants={itemVariants} className="space-y-5">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  Patient Reports Archive
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-black text-gray-400 uppercase tracking-widest">{reports.length} Records</span>
                </h3>
                <div className="grid lg:grid-cols-2 gap-6">
                  {reports.length > 0 ? reports.map((rep, index) => {
                    const clinicNumber = reports.length - index;
                    return (
                      <motion.div
                        key={rep._id}
                        variants={itemVariants}
                        whileHover={{ y: -4 }}
                        className="bg-white border-2 border-gray-50 rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 flex flex-col gap-6 relative overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 bg-teal-500 text-white px-5 py-2 rounded-bl-[2rem] font-black text-xs uppercase tracking-widest shadow-md">
                          VISIT #{clinicNumber}
                        </div>
                        {rep.report_photo ? (
                          <div
                            className="w-full h-52 bg-gray-50 rounded-[2rem] border border-gray-100 overflow-hidden cursor-zoom-in relative group/img"
                            onClick={() => {
                              const newTab = window.open();
                              if (newTab) {
                                newTab.document.body.innerHTML = `<img src="${rep.report_photo}" style="max-width:100%; height:auto; display:block; margin:auto; padding:2rem;" />`;
                              }
                            }}
                          >
                            {rep.report_photo.includes("application/pdf") ? (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                <FileText className="h-16 w-16 mb-2 opacity-30" />
                                <span className="text-xs font-black uppercase tracking-widest">View Document</span>
                              </div>
                            ) : (
                              <img src={rep.report_photo} className="w-full h-full object-contain p-4 grayscale-[0.15] group-hover/img:grayscale-0 transition-all" />
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-xs font-black text-gray-300 uppercase tracking-widest">No Photo</div>
                        )}
                        <div className="space-y-4">
                          <div className="flex justify-between items-end border-b border-gray-50 pb-4">
                            <div>
                              <p className="font-black text-xl text-gray-900">{rep.patient?.name}</p>
                              <p className="text-xs font-bold text-gray-400">MRN: {rep.patient?.mrn}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-0.5">Date</p>
                              <p className="text-sm font-black text-gray-800">{new Date(rep.report_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: "Weight", val: `${rep.weight} kg` },
                              { label: "Blood Pressure", val: rep.blood_pressure },
                              { label: "Sugar Level", val: rep.sugar_level },
                              { label: "BMI", val: rep.bmi },
                            ].map((stat, i) => (
                              <div key={i} className="bg-gray-50 p-4 rounded-2xl hover:bg-teal-50 transition-colors group/stat border border-gray-100">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="font-black text-lg text-gray-900 group-hover/stat:text-teal-600 transition-colors">{stat.val}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    );
                  }) : (
                    <div className="text-center py-24 bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-[3rem] lg:col-span-2">
                      <FileText className="h-14 w-14 mx-auto mb-4 text-gray-200" />
                      <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Reports Uploaded Yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>

          ) : (
            /* ─── MAIN OVERVIEW ────────────────────────────── */
            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-10 pb-12">

              {/* Stat Cards + Quick Actions Row */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Stat Cards */}
                <div className="xl:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-5">
                  <StatCard
                    title="Active Patients"
                    value={patients.length}
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
                    value={patients.filter(p => p.risk_level === 'High').length}
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
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-[2.5rem] border border-gray-100 p-7 shadow-xl shadow-gray-200/50 flex flex-col justify-between"
                >
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-5">Quick Actions</p>
                  <div className="space-y-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12 rounded-2xl text-teal-700 bg-teal-50 hover:bg-teal-500 hover:text-white font-black text-xs uppercase tracking-widest transition-all"
                      onClick={() => setIsRegisterModalOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Register Patient
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12 rounded-2xl text-indigo-700 bg-indigo-50 hover:bg-indigo-500 hover:text-white font-black text-xs uppercase tracking-widest transition-all"
                      onClick={() => {
                        setSelectedPatientForAppointment(null);
                        setIsAppointmentModalOpen(true);
                      }}
                    >
                      <Calendar className="h-4 w-4" />
                      Schedule Consult
                    </Button>
                  </div>
                </motion.div>
              </motion.div>

              {/* Patients Section */}
              <motion.div variants={itemVariants} className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-gray-900">Assigned Patients</h2>
                  <span className="px-4 py-1.5 bg-teal-50 text-teal-700 rounded-full text-xs font-black uppercase tracking-widest border border-teal-100">
                    {patients.length} Active
                  </span>
                </div>
                <div className="space-y-4">
                  {patients.length > 0 ? (
                    patients.map((patient, i) => (
                      <motion.div
                        key={patient._id}
                        variants={itemVariants}
                        whileHover={{ y: -2 }}
                      >
                        <PatientCard
                          name={patient.name}
                          id={patient.mrn}
                          gestationWeeks={0}
                          status={patient.risk_level === 'High' ? 'high-risk' : (patient.risk_level === 'Medium' ? 'pending' : 'normal')}
                          nextVisit={patient.contact_number}
                          isHighlighted={patient.risk_level === 'High'}
                          onClick={() => navigate(`/midwife/patients/${patient._id}`)}
                          onAlert={() => {
                            setSelectedPatientForSMS(patient);
                            setIsEmergencySMSModalOpen(true);
                          }}
                          onAppointment={() => {
                            setSelectedPatientForAppointment(patient);
                            setIsAppointmentModalOpen(true);
                          }}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-24 bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-[3rem]">
                      <Users className="h-14 w-14 mx-auto mb-4 text-gray-200" />
                      <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Patients Registered Yet</p>
                      <Button
                        className="mt-6 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl px-8 h-12 shadow-lg shadow-teal-100"
                        onClick={() => setIsRegisterModalOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Register First Patient
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </main>

        <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 text-primary-foreground">
              <DialogTitle className="text-xl font-bold text-white">Register New Patient</DialogTitle>
              <DialogDescription className="text-primary-foreground/70 text-sm mt-1">
                Fill in the patient's personal and clinical information below.
              </DialogDescription>
            </div>

            <form onSubmit={handleRegisterPatient} className="px-6 py-5 space-y-5">

              {/* Section: Personal Info */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <span className="inline-block w-4 h-px bg-muted-foreground/40"></span>
                  Personal Information
                  <span className="inline-block flex-1 h-px bg-muted-foreground/20"></span>
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      placeholder="e.g. Amara Silva"
                      className="h-10"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mrn" className="text-sm font-medium">MRN <span className="text-red-500">*</span></Label>
                    <Input
                      id="mrn"
                      placeholder="e.g. MRN-1042"
                      className="h-10"
                      value={formData.mrn}
                      onChange={(e) => setFormData({ ...formData, mrn: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g. patient@gmail.com"
                      className="h-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="age" className="text-sm font-medium">Age <span className="text-red-500">*</span></Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="e.g. 26"
                      className="h-10"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-medium">Contact Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="phone"
                      placeholder="+94 7X XXX XXXX"
                      className="h-10"
                      value={formData.contact_number}
                      onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label htmlFor="address" className="text-sm font-medium">Address <span className="text-red-500">*</span></Label>
                    <Input
                      id="address"
                      placeholder="Street, City, District"
                      className="h-10"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section: Clinical Info */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <span className="inline-block w-4 h-px bg-muted-foreground/40"></span>
                  Clinical Information
                  <span className="inline-block flex-1 h-px bg-muted-foreground/20"></span>
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <Label htmlFor="medical_history" className="text-sm font-medium">Medical History</Label>
                    <textarea
                      id="medical_history"
                      placeholder="Previous conditions, surgeries, allergies..."
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      value={formData.medical_history}
                      onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="delivery_date" className="text-sm font-medium">Expected Delivery Date</Label>
                    <Input
                      id="delivery_date"
                      type="date"
                      className="h-10"
                      value={formData.delivery_date}
                      onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="riskLevel" className="text-sm font-medium">Risk Level <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.risk_level}
                      onValueChange={(value) => setFormData({ ...formData, risk_level: value })}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Low Risk
                          </span>
                        </SelectItem>
                        <SelectItem value="Medium">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span> Medium Risk
                          </span>
                        </SelectItem>
                        <SelectItem value="High">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> High Risk
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="px-6"
                  onClick={() => setIsRegisterModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="px-6 gap-2">
                  {isLoading ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"></span>
                      Registering...
                    </>
                  ) : (
                    "Register Patient"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Emergency SMS Modal */}
        <Dialog open={isEmergencySMSModalOpen} onOpenChange={setIsEmergencySMSModalOpen}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
            <div className="bg-emergency p-6 text-white text-center pb-8">
              <DialogHeader className="p-0">
                <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/30">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <DialogTitle className="text-xl font-black italic tracking-tighter text-white">EMERGENCY DISPATCH</DialogTitle>
                <DialogDescription className="text-white/80 text-sm">Send high-priority SMS to {selectedPatientForSMS?.name}</DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-8 space-y-5 bg-background">
               <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Emergency Instructions</Label>
                  <textarea
                    placeholder="e.g. Please come to the hospital immediately. Reduced fetal movement noticed in your records."
                    className="flex min-h-[120px] w-full rounded-2xl border-none bg-muted/30 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emergency text-foreground font-medium"
                    value={emergencySMSMessage}
                    onChange={(e) => setEmergencySMSMessage(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground italic px-1 pt-1 font-medium">
                    This message is sent via SMS gateway and is not recorded in the clinical history.
                  </p>
               </div>
               <div className="flex gap-4 pt-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsEmergencySMSModalOpen(false)}
                    className="flex-1 h-12 rounded-2xl font-bold"
                    disabled={isSendingSMS}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSendEmergencySMS}
                    disabled={isSendingSMS}
                    className="flex-1 bg-emergency hover:bg-emergency/90 text-white font-black rounded-2xl h-12 shadow-lg shadow-emergency/20 gap-2"
                  >
                    {isSendingSMS ? "Dispatching..." : (
                      <>
                        <Zap className="h-4 w-4 fill-current" />
                        SEND URGENT SMS
                      </>
                    )}
                  </Button>
               </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* Appointment Modal */}
        <Dialog open={isAppointmentModalOpen} onOpenChange={setIsAppointmentModalOpen}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
            <div className="bg-primary p-6 text-white text-center pb-8">
              <DialogHeader className="p-0">
                <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/30">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <DialogTitle className="text-xl font-black italic tracking-tighter text-white">PHYSICIAN REFERRAL</DialogTitle>
                <DialogDescription className="text-white/80 text-sm">
                  {selectedPatientForAppointment 
                    ? `Schedule ${selectedPatientForAppointment.name} for a consultation`
                    : "Schedule a patient consultation with a specialist"}
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-8 space-y-5 bg-background">
               <div className="space-y-4">
                  {/* Patient Selection (if not pre-selected) */}
                  {!selectedPatientForAppointment && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Select Patient</Label>
                      <Select 
                        value={selectedPatientForAppointment?._id} 
                        onValueChange={(val) => {
                          const p = patients.find(p => p._id === val);
                          setSelectedPatientForAppointment(p);
                        }}
                      >
                        <SelectTrigger className="w-full h-12 rounded-2xl border-none bg-muted/30 px-4">
                          <SelectValue placeholder="Choose a patient..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {patients.map(p => (
                            <SelectItem key={p._id} value={p._id} className="rounded-lg">
                              {p.name} ({p.mrn})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Select Physician</Label>
                    <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                      <SelectTrigger className="w-full h-12 rounded-2xl border-none bg-muted/30 px-4">
                        <SelectValue placeholder="Choose a doctor..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {doctors.map(doc => (
                          <SelectItem key={doc._id} value={doc._id} className="rounded-lg">
                            <div className="flex flex-col">
                              <span className="font-bold">{doc.name}</span>
                              <span className="text-[10px] text-muted-foreground">{doc.specialization}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Appointment Date</Label>
                      <Input
                        type="date"
                        className="h-12 rounded-2xl border-none bg-muted/30 px-4 font-medium"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Time Slot</Label>
                      <Input
                        type="time"
                        className="h-12 rounded-2xl border-none bg-muted/30 px-4 font-medium"
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Clinical Notes (Referral Message)</Label>
                    <textarea
                      placeholder="e.g. Please review glucose reports. Patient showing signs of gestational diabetes."
                      className="flex min-h-[100px] w-full rounded-2xl border-none bg-muted/30 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground font-medium"
                      value={appointmentPurpose}
                      onChange={(e) => setAppointmentPurpose(e.target.value)}
                    />
                  </div>
               </div>

               <div className="flex gap-4 pt-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsAppointmentModalOpen(false)}
                    className="flex-1 h-12 rounded-2xl font-bold"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleScheduleAppointment}
                    disabled={isScheduling}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl h-12 shadow-lg shadow-primary/20 gap-2"
                  >
                    {isScheduling ? "Scheduling..." : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        CONFIRM APPOINTMENT
                      </>
                    )}
                  </Button>
               </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
