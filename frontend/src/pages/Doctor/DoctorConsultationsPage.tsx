import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { 
  Stethoscope, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  ClipboardList,
  MessageCircle,
  AlertCircle,
  FileText,
  ShieldCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config";


export default function DoctorConsultationsPage() {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Finalize Action State
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [medicalAdvice, setMedicalAdvice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/doctor/consultations`, {
        credentials: 'include'
      });
      const data = await resp.json();
      setConsultations(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load clinical schedule");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!medicalAdvice.trim()) {
      return toast.error("Please provide medical advice before finalizing.");
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctor/advice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          appointmentId: selectedConsultation._id,
          advice: medicalAdvice
        })
      });

      if (response.ok) {
        toast.success("Consultation finalized successfully.");
        setIsFinalizeModalOpen(false);
        setMedicalAdvice("");
        fetchConsultations(); // Refresh list
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to finalize consultation.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredConsultations = consultations.filter(c => {
    const matchesSearch = c.patient?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar variant="doctor" />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header 
          title="Clinical Consultations" 
          subtitle="Manage appointments, medical advice and case completions" 
        />

        <main className="flex-1 overflow-auto p-8 bg-muted/20">
          {/* Controls */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-4 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by patient or purpose..." 
                  className="pl-10 h-12 rounded-2xl bg-card border-none shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-2xl shadow-sm border border-muted">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select 
                  className="bg-transparent text-sm font-bold outline-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl border-none shadow-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-none">
                  <TableHead className="py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Consultation Details</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Patient</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Date & Time</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                     <TableCell colSpan={5} className="h-32 text-center text-muted-foreground font-medium italic">Retrieving clinical schedule...</TableCell>
                  </TableRow>
                ) : filteredConsultations.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={5} className="h-32 text-center text-muted-foreground font-medium italic">No consultations matching your criteria.</TableCell>
                  </TableRow>
                ) : filteredConsultations.map((c) => (
                  <TableRow key={c._id} className="border-none hover:bg-muted/30 transition-colors group">
                    <TableCell className="py-5 px-8">
                       <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                             <ClipboardList className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                             <p className="font-black text-foreground tracking-tight">{c.purpose}</p>
                             {c.advice && (
                                <p className="text-[10px] font-medium text-muted-foreground mt-1 line-clamp-1 italic">"{c.advice}"</p>
                             )}
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center font-bold text-xs">
                             {c.patient?.name?.charAt(0)}
                          </div>
                          <span className="font-bold text-sm">{c.patient?.name}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-bold">
                             <Calendar className="h-3 w-3 text-primary" />
                             {new Date(c.appointmentDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase">
                             <Clock className="h-3 w-3" />
                             {new Date(c.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge className={`rounded-xl px-3 py-1 font-black text-[9px] uppercase tracking-tighter shadow-sm border-none ${
                          (c.status === 'Completed' || c.status === 'Consulting Finished') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700 animate-pulse'
                       }`}>
                          {c.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right py-5 px-8">
                       <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                             <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                             onClick={() => {
                                setSelectedConsultation(c);
                                setMedicalAdvice(c.advice || "");
                                setIsFinalizeModalOpen(true);
                             }}
                             className={cn(
                                "h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 hover:scale-[1.05] transition-all",
                                (c.status === 'Completed' || c.status === 'Consulting Finished') ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-primary text-white shadow-lg shadow-primary/20"
                             )}
                          >
                             <CheckCircle2 className="h-3.5 w-3.5" />
                             {(c.status === 'Completed' || c.status === 'Consulting Finished') ? "Updated" : "Finished"}
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>

        {/* Finalize Consultation Modal */}
        <Dialog open={isFinalizeModalOpen} onOpenChange={setIsFinalizeModalOpen}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
            <div className="bg-primary p-6 text-white text-center pb-8">
              <DialogHeader className="p-0 text-white">
                <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/30 text-white">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <DialogTitle className="text-xl font-black italic tracking-tighter text-white uppercase text-white">Clinical Finalization</DialogTitle>
                <DialogDescription className="text-white/80 text-sm text-white">
                  Recording medical advice for {selectedConsultation?.patient?.name}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-8 space-y-6 bg-background text-black">
              <div className="space-y-4">
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                  <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest mb-1">Appointment Purpose</p>
                  <p className="text-sm font-bold text-foreground">{selectedConsultation?.purpose}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Doctor's Consultation</Label>
                  <textarea 
                    placeholder="Enter detailed medical guidance, prescriptions, or follow-up instructions..."
                    className="flex min-h-[150px] w-full rounded-2xl border-none bg-muted/30 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground font-medium"
                    value={medicalAdvice}
                    onChange={(e) => setMedicalAdvice(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground italic px-1 font-medium italic">
                    This advice will be immediately visible to the patient and mid-wife.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsFinalizeModalOpen(false)}
                  className="flex-1 h-12 rounded-2xl font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleFinalize}
                  disabled={isSubmitting}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl h-12 shadow-lg shadow-primary/20 gap-2"
                >
                  {isSubmitting ? "Processing..." : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      SAVE & COMPLETE
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
