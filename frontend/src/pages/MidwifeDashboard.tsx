import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { PatientCard } from "@/components/PatientCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Users, Baby, AlertTriangle, Zap, Search, Calendar, Edit, Upload, FileText, ChevronRight, Plus } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

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
  
  // Emergency SMS State
  const [isEmergencySMSModalOpen, setIsEmergencySMSModalOpen] = useState(false);
  const [emergencySMSMessage, setEmergencySMSMessage] = useState("");
  const [selectedPatientForSMS, setSelectedPatientForSMS] = useState<any>(null);
  const [isSendingSMS, setIsSendingSMS] = useState(false);

  const fetchPatients = async () => {
    try {
      const response = await fetch(`http://${window.location.hostname}:5001/api/patients`, {
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
      const response = await fetch(`http://${window.location.hostname}:5001/api/alerts`, {
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
    if (isAlertsMode) {
      fetchAlerts();
    }
    if (isReportsMode) {
      fetchReports();
    }
  }, [isAlertsMode, isReportsMode]);

  const fetchReports = async () => {
    try {
      const response = await fetch(`http://${window.location.hostname}:5001/api/clinical-reports`, {
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
      const response = await fetch(`http://${window.location.hostname}:5001/api/clinical-reports`, {
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
      const response = await fetch(`http://${window.location.hostname}:5001/api/alerts`, {
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
      const response = await fetch(`http://${window.location.hostname}:5001/api/patients`, {
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
      const response = await fetch(`http://${window.location.hostname}:5001/api/sms/send-to-patient`, {
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
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        variant="midwife" 
        userName={user?.name || "Midwife User"} 
        userRole={user?.role === 'midwife' ? 'Senior Midwife' : 'Clinical Administrator'} 
      />

      <div className="flex-1 flex flex-col">
        <Header
          title="Midwife Dashboard"
          subtitle="Care management for maternal health"
          showRegisterPatient
          onRegisterPatient={() => setIsRegisterModalOpen(true)}
        />

        <main className="flex-1 p-8 overflow-auto">
          {isAlertsMode ? (
            <div className="space-y-6 max-w-4xl">
              <div className="flex items-center gap-3 border-b pb-4">
                <AlertTriangle className="h-8 w-8 text-emergency" />
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Medical Alerts</h2>
                  <p className="text-muted-foreground text-sm">Send urgent medical prescriptions and alerts to your patients.</p>
                </div>
              </div>

              {/* Alert Chat Box Form */}
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Send New Alert</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="mb-1.5 block">Select Patient</Label>
                    <Select value={selectedPatientForAlert} onValueChange={setSelectedPatientForAlert}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select patient to alert..." />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map(p => (
                          <SelectItem key={p._id} value={p._id}>{p.name} - {p.mrn}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Alert Prescriptions / Message</Label>
                    <textarea 
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]"
                      placeholder="Type the exact prescription, medical advice, or alert message here..."
                      value={alertMessageText}
                      onChange={(e) => setAlertMessageText(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full bg-emergency hover:bg-emergency/90 text-white gap-2"
                    onClick={handleSendAlert}
                    disabled={isSendingAlert}
                  >
                    {isSendingAlert ? "Sending..." : "Dispatch Medical Alert"}
                  </Button>
                </div>
              </div>

              {/* Alerts List */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Alert History</h3>
                <div className="space-y-3">
                  {alerts.length > 0 ? (
                    alerts.map((alert) => {
                      const isPatientSender = alert.sender === 'Patient';
                      // Use a different color logic based on the sender
                      const borderClass = isPatientSender ? 'border-emergency/30 bg-emergency/5' : 'border-primary/30 bg-primary/5';
                      const badgeBg = isPatientSender ? 'bg-emergency/10 text-emergency' : 'bg-primary/10 text-primary';
                      return (
                        <div key={alert._id} className={`p-4 rounded-xl border ${borderClass} flex flex-col`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${badgeBg}`}>
                                {isPatientSender ? "From Patient" : "To Patient"}
                              </span>
                              <span className="font-semibold text-foreground">{alert.patient?.name} ({alert.patient?.mrn})</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(alert.alertDate).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-foreground">{alert.message}</p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center p-8 bg-muted/20 border border-dashed rounded-xl text-muted-foreground">
                      No alerts triggered yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : isReportsMode ? (
            <div className="space-y-6 max-w-4xl">
              <div className="flex items-center gap-3 border-b pb-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Clinical Reports</h2>
                  <p className="text-muted-foreground text-sm">Upload physical clinical documents and record patient vitals.</p>
                </div>
              </div>

              {/* Upload Form */}
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">New Clinical Log</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="mb-1.5 block">Select Patient</Label>
                    <Select value={selectedPatientForReport} onValueChange={setSelectedPatientForReport}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select patient..." />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map(p => (
                          <SelectItem key={p._id} value={p._id}>{p.name} - {p.mrn}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Weight (kg)</Label>
                    <Input type="number" placeholder="e.g. 68" value={reportWeight} onChange={e => setReportWeight(e.target.value)} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">BMI</Label>
                    <Input type="number" step="0.1" placeholder="e.g. 24.5" value={reportBMI} onChange={e => setReportBMI(e.target.value)} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Blood Pressure</Label>
                    <Input placeholder="e.g. 120/80" value={reportBP} onChange={e => setReportBP(e.target.value)} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Sugar Level</Label>
                    <Input placeholder="e.g. 90 mg/dL" value={reportSugar} onChange={e => setReportSugar(e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <Label className="mb-1.5 block">Report Scan/Photo</Label>
                    <Input type="file" accept="image/*,.pdf" onChange={handlePhotoUpload} className="cursor-pointer file:text-primary file:bg-primary/10 file:border-0 file:rounded-md file:px-4 file:py-1 hover:file:bg-primary/20 bg-muted/30" />
                    {reportPhoto && (
                      <div className="mt-3 relative w-full h-32 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                         {reportPhoto.includes("application/pdf") ? <span className="text-sm font-semibold">PDF Attached</span> : <img src={reportPhoto} alt="Preview" className="h-full object-contain" />}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 mt-2">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white gap-2" onClick={handleUploadReport} disabled={isUploadingReport}>
                      {isUploadingReport ? "Uploading..." : "Save Clinical Report"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Uploaded History */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Patient Reports Archive</h3>
                <div className="space-y-4">
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
                          <div className="w-full h-64 bg-muted/30 rounded-xl border-2 border-dashed flex items-center justify-center text-sm font-medium text-muted-foreground">No Photo Available</div>
                        )}
                        
                        {/* Metadata underneath */}
                        <div className="w-full">
                          <div className="flex justify-between items-center mb-4 border-b border-primary/10 pb-3">
                            <div className="truncate">
                              <span className="font-bold text-2xl text-primary">{rep.patient?.name}</span>
                              <span className="ml-2 text-md text-muted-foreground mr-1">({rep.patient?.mrn})</span>
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
                    <div className="text-center p-8 bg-muted/20 border border-dashed rounded-xl text-muted-foreground">
                      No reports uploaded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
                <div className="xl:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                <div className="bg-card rounded-xl border p-5">
                  <h3 className="font-semibold text-foreground mb-4 uppercase text-xs tracking-wide">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 text-primary border-primary/20 hover:bg-primary/5"
                      onClick={() => setIsRegisterModalOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Register New Patient
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Assigned Patients</h2>
                  <div className="space-y-3">
                    {patients.length > 0 ? (
                      patients.map((patient) => (
                        <PatientCard
                          key={patient._id}
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
                        />
                      ))
                    ) : (
                      <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed text-muted-foreground">
                        No patients registered
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
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
              <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/30">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-black italic tracking-tighter">EMERGENCY DISPATCH</h2>
              <p className="text-white/80 text-sm">Send high-priority SMS to {selectedPatientForSMS?.name}</p>
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
      </div>
    </div>
  );
}
