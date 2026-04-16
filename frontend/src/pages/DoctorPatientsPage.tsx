import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  FileText, 
  MessageCircle, 
  Download,
  ShieldAlert,
  Calendar,
  History,
  Info
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

export default function DoctorPatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal States
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  // Advice States
  const [isAdviceModalOpen, setIsAdviceModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [adviceText, setAdviceText] = useState("");
  const [isSubmittingAdvice, setIsSubmittingAdvice] = useState(false);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userInfo);
    if (user.role !== 'doctor' && user.role !== 'admin') {
      navigate("/login");
      return;
    }
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const resp = await fetch(`http://${window.location.hostname}:5001/api/doctor/patients`, {
        credentials: 'include'
      });
      const data = await resp.json();
      setPatients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetails = async (id: string) => {
    setIsFetchingDetails(true);
    try {
      const resp = await fetch(`http://${window.location.hostname}:5001/api/doctor/patients/${id}`, {
        credentials: 'include'
      });
      const data = await resp.json();
      setPatientDetails(data);
    } catch (err) {
      toast.error("Failed to fetch detailed clinical profile");
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleOpenDetails = (patient: any) => {
    setSelectedPatient(patient);
    setIsDetailModalOpen(true);
    fetchDetails(patient._id);
  };

  const handleOpenAdvice = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsAdviceModalOpen(true);
    setAdviceText(appointment.advice || "");
  };

  const handleSubmitAdvice = async () => {
    if (!adviceText.trim()) return toast.error("Please enter medical advice");
    
    setIsSubmittingAdvice(true);
    try {
      const resp = await fetch(`http://${window.location.hostname}:5001/api/doctor/advice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          appointmentId: selectedAppointment._id,
          advice: adviceText
        })
      });

      if (resp.ok) {
        toast.success("Advice submitted and consultation completed");
        setIsAdviceModalOpen(false);
        fetchDetails(selectedPatient._id); // Refresh details
      } else {
        toast.error("Failed to submit advice");
      }
    } catch (err) {
      toast.error("Communication failure");
    } finally {
      setIsSubmittingAdvice(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.mrn?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === "all" || p.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar variant="doctor" />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header 
          title="Patient Directory" 
          subtitle="Assigned Clinical Cases & Medical Histories" 
        />

        <main className="flex-1 overflow-auto p-8 bg-muted/20">
          {/* Header Controls */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-4 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, ID or MRN..." 
                  className="pl-10 h-12 rounded-2xl bg-card border-none shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-2xl shadow-sm border border-muted">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select 
                  className="bg-transparent text-sm font-bold outline-none"
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                >
                  <option value="all">All Risk Levels</option>
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl border-none shadow-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-none">
                  <TableHead className="py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Patient Identity</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Identity MRN</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Risk Status</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Joined Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground font-medium italic">Synchronizing patient records...</TableCell>
                  </TableRow>
                ) : filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground font-medium italic">No matches found in your assigned registry.</TableCell>
                  </TableRow>
                ) : filteredPatients.map((patient) => (
                  <TableRow key={patient._id} className="border-none hover:bg-muted/30 transition-colors group">
                    <TableCell className="py-5 px-8">
                      <div 
                        className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleOpenDetails(patient)}
                      >
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border ${
                          patient.risk_level === 'High' ? 'bg-emergency/10 text-emergency border-emergency/20' : 
                          patient.risk_level === 'Medium' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                          'bg-primary/10 text-primary border-primary/20'
                        }`}>
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-foreground tracking-tight">{patient.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Age: {patient.age} • Female</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded-md text-[10px] font-black tracking-widest text-foreground/70">
                        {patient.mrn || "UNASSIGNED"}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-xl px-4 py-1.5 font-black text-[10px] uppercase tracking-tighter shadow-sm border-none ${
                        patient.risk_level === 'High' ? 'bg-emergency text-white animate-pulse' : 
                        patient.risk_level === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {patient.risk_level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-bold text-muted-foreground">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>

      {/* Patient Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl max-h-[90vh] flex flex-col">
           {/* Top Profile Banner */}
           <div className={`p-10 text-white relative flex items-center gap-6 ${
              selectedPatient?.risk_level === 'High' ? 'bg-emergency' : 'bg-primary'
           }`}>
              <div className="h-28 w-28 rounded-[2rem] bg-white/20 border-4 border-white/30 flex items-center justify-center font-black text-4xl backdrop-blur-md shadow-xl">
                 {selectedPatient?.name?.charAt(0)}
              </div>
              <div className="flex-1">
                 <div className="flex items-center gap-3">
                    <h2 className="text-4xl font-black tracking-tighter">{selectedPatient?.name}</h2>
                    <Badge className="bg-white/20 text-white border-white/40 font-black rounded-lg">
                       {selectedPatient?.risk_level} RISK
                    </Badge>
                 </div>
                 <p className="text-white/80 font-bold tracking-widest uppercase text-xs mt-2 opacity-80 flex items-center gap-4">
                    <span>MRN: {selectedPatient?.mrn}</span>
                    <span>Age: {selectedPatient?.age}</span>
                    <span>Gestation: Week 32</span>
                 </p>
              </div>
              <div className="flex flex-col gap-2">
                 <Button className="bg-white text-primary hover:bg-white/90 font-black rounded-xl h-12 gap-2 shadow-xl px-6">
                    <MessageCircle className="h-5 w-5" />
                    Open Chat
                 </Button>
              </div>
           </div>

           <div className="flex-1 overflow-auto bg-muted/30 p-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Left: Medical History */}
                 <div className="lg:col-span-2 space-y-8">
                    <div className="bg-card rounded-3xl p-8 shadow-sm">
                       <h3 className="text-lg font-black tracking-tight mb-6 flex items-center gap-2">
                          <History className="h-5 w-5 text-primary" />
                          Clinical Records & Intake
                       </h3>
                       <div className="prose prose-sm font-medium text-muted-foreground italic leading-relaxed bg-muted/50 p-6 rounded-2xl border border-dashed border-muted-foreground/20">
                          {selectedPatient?.medical_history || "No prior clinical history documented for this patient case."}
                       </div>
                    </div>

                    <div className="bg-card rounded-3xl p-8 shadow-sm">
                       <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                             <Calendar className="h-5 w-5 text-primary" />
                             Consultation Timeline
                          </h3>
                       </div>
                       
                       <div className="space-y-4">
                          {isFetchingDetails ? (
                             <div className="animate-pulse space-y-4">
                                <div className="h-20 bg-muted rounded-2xl" />
                                <div className="h-20 bg-muted rounded-2xl" />
                             </div>
                          ) : patientDetails?.consultations.length === 0 ? (
                             <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
                                <Info className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p className="font-bold">No historical consultations detected.</p>
                             </div>
                          ) : patientDetails?.consultations.map((consult: any) => (
                             <div key={consult._id} className="p-6 bg-muted/30 rounded-2xl border border-muted flex items-center justify-between group hover:bg-muted/50 transition-all">
                                <div>
                                   <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">{new Date(consult.appointmentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                   <p className="font-bold text-lg mt-1">{consult.purpose}</p>
                                   {consult.advice && (
                                      <p className="text-sm font-medium text-muted-foreground line-clamp-1 mt-1 italic">"{consult.advice}"</p>
                                   )}
                                </div>
                                <div className="flex items-center gap-3">
                                   <Badge className={`rounded-xl px-3 py-1 font-bold text-[10px] uppercase ${
                                      (consult.status === 'Completed' || consult.status === 'Consulting Finished') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                   }`}>
                                      {consult.status}
                                   </Badge>
                                   {consult.status === 'Scheduled' && (
                                      <Button 
                                        onClick={() => handleOpenAdvice(consult)}
                                        className="h-10 px-4 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
                                      >
                                         Attach Advice
                                      </Button>
                                   )}
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* Right: Risk Analysis & Files */}
                 <div className="space-y-8">
                    <div className="bg-card rounded-3xl p-8 shadow-sm border border-emergency/10 border-l-4 border-l-emergency">
                       <h3 className="text-sm font-black text-emergency uppercase tracking-widest mb-4 flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4" />
                          Risk Assessment
                       </h3>
                       <div className="space-y-4">
                          <div className="flex items-end justify-between">
                             <p className="text-3xl font-black">{selectedPatient?.risk_level}</p>
                             <p className="text-xs font-bold text-muted-foreground pb-1 uppercase">Probability index</p>
                          </div>
                          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                             <div className={`h-full ${
                                selectedPatient?.risk_level === 'High' ? 'bg-emergency w-full' : 
                                selectedPatient?.risk_level === 'Medium' ? 'bg-amber-500 w-2/3' : 'bg-emerald-500 w-1/3'
                             }`} />
                          </div>
                       </div>
                    </div>

                    <div className="bg-card rounded-3xl p-8 shadow-sm">
                       <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-6 px-1">Artifact Library</h3>
                       <div className="space-y-3">
                          <div className="p-4 bg-muted/50 rounded-2xl border border-muted hover:border-primary transition-colors cursor-pointer group flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                   <Download className="h-4 w-4" />
                                </div>
                                <div>
                                   <p className="text-sm font-bold">Lab_Report_Feb24.pdf</p>
                                   <p className="text-[10px] text-muted-foreground uppercase font-bold">Clinical PDF • 2.4 MB</p>
                                </div>
                             </div>
                          </div>
                          <div className="p-4 bg-muted/50 rounded-2xl border border-muted hover:border-primary transition-colors cursor-pointer group flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                   <Download className="h-4 w-4" />
                                </div>
                                <div>
                                   <p className="text-sm font-bold">Ultrasound_Scan_Mar.jpg</p>
                                   <p className="text-[10px] text-muted-foreground uppercase font-bold">DICOM Image • 14 MB</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-8 border-t bg-background flex justify-end gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setIsDetailModalOpen(false)}
                className="rounded-xl h-12 px-8 font-bold"
              >
                 Close Case View
              </Button>
           </div>
        </DialogContent>
      </Dialog>

      {/* Advice Submission Modal */}
      <Dialog open={isAdviceModalOpen} onOpenChange={setIsAdviceModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-8 border-none shadow-2xl">
           <DialogHeader>
              <DialogTitle className="text-xl font-black">Record Clinical Advice</DialogTitle>
              <DialogDescription className="font-medium pt-1">
                 Your advice will be saved to the registry and the consultation for <span className="font-bold text-foreground">{selectedPatient?.name}</span> will be marked as **Completed**.
              </DialogDescription>
           </DialogHeader>

           <div className="space-y-6 pt-6">
              <div className="space-y-2">
                 <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Chief Complaint / Purpose</Label>
                 <Input disabled value={selectedAppointment?.purpose} className="h-12 rounded-2xl bg-muted/50 border-none px-4 font-bold" />
              </div>
              <div className="space-y-2">
                 <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Medical Guidance & Instructions</Label>
                 <textarea 
                   value={adviceText}
                   onChange={(e) => setAdviceText(e.target.value)}
                   className="w-full h-40 rounded-2xl bg-muted/50 border-none p-4 font-medium focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                   placeholder="Write detailed medical instructions here..."
                 />
              </div>

              <div className="flex gap-3">
                 <Button 
                    variant="ghost" 
                    onClick={() => setIsAdviceModalOpen(false)}
                    className="flex-1 h-12 rounded-2xl font-bold"
                 >
                    Cancel
                 </Button>
                 <Button 
                    onClick={handleSubmitAdvice}
                    disabled={isSubmittingAdvice}
                    className="flex-1 h-12 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/20"
                 >
                    {isSubmittingAdvice ? "Syncing..." : "Finalize Consultation"}
                 </Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
