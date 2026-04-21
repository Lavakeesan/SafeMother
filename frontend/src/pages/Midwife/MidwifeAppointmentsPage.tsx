import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Plus, Search, Filter, ShieldCheck, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/config";


export default function MidwifeAppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [purpose, setPurpose] = useState("");

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userInfo);
    if (user.role !== 'midwife' && user.role !== 'admin') {
      navigate("/login");
      return;
    }
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [appResp, patResp, docResp] = await Promise.all([
        fetch(`${API_BASE_URL}/api/appointments`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/patients`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/doctor`, { credentials: "include" })
      ]);

      if (appResp.ok) setAppointments(await appResp.json());
      if (patResp.ok) setPatients(await patResp.json());
      if (docResp.ok) setDoctors(await docResp.json());
    } catch (err) {
      console.error(err);
      toast.error("Failed to load clinical data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!selectedPatientId || !selectedDoctorId || !appointmentDate || !appointmentTime) {
      return toast.error("Please fill all required fields");
    }

    setIsScheduling(true);
    try {
      const dateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          patientId: selectedPatientId,
          doctorId: selectedDoctorId,
          appointmentDate: dateTime.toISOString(),
          purpose
        })
      });

      if (response.ok) {
        toast.success("Appointment scheduled successfully");
        setIsModalOpen(false);
        fetchInitialData(); // Refresh list
        // Reset form
        setSelectedPatientId("");
        setSelectedDoctorId("");
        setAppointmentDate("");
        setAppointmentTime("");
        setPurpose("");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to schedule");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsScheduling(false);
    }
  };

  const filteredAppointments = appointments.filter(app => 
    app.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.doctor?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar variant="midwife" />
      
      <main className="flex-1 flex flex-col">
        <Header 
          title="Clinical Consultations" 
          subtitle="Manage patient referrals and physician appointments"
        />
        
        <div className="p-8 space-y-8">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-6 rounded-2xl border shadow-sm">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient or doctor..."
                className="pl-10 h-11 rounded-xl bg-muted/30 border-none px-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
               onClick={() => setIsModalOpen(true)}
               className="w-full sm:w-auto h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-lg shadow-primary/20"
            >
              <Plus className="h-5 w-5" />
              Schedule New Consultation
            </Button>
          </div>

          {/* Appointments Grid/Table */}
          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">Patient</TableHead>
                  <TableHead className="font-bold">Specialist</TableHead>
                  <TableHead className="font-bold">Schedule</TableHead>
                  <TableHead className="font-bold">Clinical Notes</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5} className="h-16 animate-pulse bg-muted/20" />
                    </TableRow>
                  ))
                ) : filteredAppointments.length > 0 ? (
                  filteredAppointments.map((app) => (
                    <TableRow key={app._id} className="hover:bg-muted/10 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{app.patient?.name}</span>
                          <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-tighter">ID: {app.patient?.mrn}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <Stethoscope className="h-4 w-4 text-indigo-600" />
                           </div>
                           <div className="flex flex-col">
                              <span className="font-semibold">{app.doctor?.name}</span>
                              <span className="text-[10px] text-muted-foreground">{app.doctor?.specialization}</span>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium flex items-center gap-1.5 break-all">
                            <Calendar className="h-3 w-3 text-primary" />
                            {new Date(app.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {new Date(app.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm truncate italic text-muted-foreground">
                          {app.purpose || "No specific notes provided"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={app.status === 'Completed' ? 'outline' : 'default'} 
                          className={cn(
                            "rounded-full px-3 py-0.5 font-bold uppercase text-[10px]",
                            app.status === 'Completed' ? "bg-green-500/10 text-green-600 border-green-200" : ""
                          )}
                        >
                          {app.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Calendar className="h-12 w-12 opacity-10" />
                        <p className="font-medium italic">No active appointments found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Schedule Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
            <div className="bg-primary p-6 text-white text-center pb-8 text-white">
              <DialogHeader className="p-0">
                <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/30">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <DialogTitle className="text-xl font-black italic tracking-tighter text-white">PHYSICIAN REFERRAL</DialogTitle>
                <DialogDescription className="text-white/80 text-sm">Coordinate a patient consultation with a specialist</DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="p-8 space-y-5 bg-background">
              <div className="space-y-4">
                <div className="space-y-1.5 text-black">
                  <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Select Patient</Label>
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger className="w-full h-12 rounded-2xl border-none bg-muted/30 px-4">
                      <SelectValue placeholder="Choose a patient..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {patients.map(p => (
                        <SelectItem key={p._id} value={p._id} className="rounded-lg">{p.name} ({p.mrn})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                    <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Date</Label>
                    <Input
                      type="date"
                      className="h-12 rounded-2xl border-none bg-muted/30 px-4 font-medium"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Time</Label>
                    <Input
                      type="time"
                      className="h-12 rounded-2xl border-none bg-muted/30 px-4 font-medium"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Handover Notes</Label>
                  <textarea
                    placeholder="Briefly describe the reason for referral..."
                    className="flex min-h-[80px] w-full rounded-2xl border-none bg-muted/30 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground font-medium"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-12 rounded-2xl font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSchedule}
                  disabled={isScheduling}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl h-12 shadow-lg shadow-primary/20 gap-2"
                >
                  {isScheduling ? "Scheduling..." : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      CONFIRM
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
