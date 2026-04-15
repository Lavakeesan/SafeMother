import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { 
  Calendar, Search, Filter, Clock, 
  MapPin, User, Stethoscope, CheckCircle2,
  CalendarCheck, AlertCircle, CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`http://${window.location.hostname}:5001/api/appointments`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (err) {
      toast.error("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = a.patient?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.midwife?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar variant="admin" />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header title="Appointment Scheduler" subtitle="Global view of all clinical consultations" />

        <main className="flex-1 overflow-auto p-8 bg-muted/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex flex-1 items-center gap-4 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search patients or midwives..." 
                  className="pl-10 h-12 rounded-2xl bg-card border-none shadow-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-2xl shadow-sm border border-muted">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <select 
                  className="bg-transparent text-sm font-bold outline-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Any Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <Button className="h-12 px-6 rounded-2xl font-bold gap-2">
              <CalendarCheck className="h-5 w-5" />
              New System Entry
            </Button>
          </div>

          <div className="bg-card rounded-3xl border-none shadow-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-none">
                  <TableHead className="py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Date & Timeline</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Patient Information</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Assigned Midwife</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Control</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell colSpan={5} className="h-16 bg-muted/10 border-none" />
                    </TableRow>
                  ))
                ) : filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-muted-foreground italic">
                      No appointments recorded in the system
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((apt) => (
                    <TableRow key={apt._id} className="group hover:bg-muted/10 border-muted/20 transition-colors">
                      <TableCell className="py-4 px-8">
                        <div className="flex items-center gap-3">
                           <div className="bg-primary/10 p-2.5 rounded-xl">
                              <Clock className="h-5 w-5 text-primary" />
                           </div>
                           <div>
                              <p className="font-black text-sm text-foreground">
                                 {new Date(apt.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                                 {new Date(apt.appointmentDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                              </p>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-foreground leading-none">{apt.patient?.name}</p>
                              <p className="text-[10px] font-medium text-muted-foreground mt-1">MRN: {apt.patient?.mrn || "N/A"}</p>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                              <Stethoscope className="h-4 w-4 text-indigo-600" />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-foreground leading-none">{apt.midwife?.name}</p>
                              <p className="text-[10px] font-medium text-muted-foreground mt-1">{apt.midwife?.hospital_name || ""}</p>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`rounded-xl border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 ${
                          apt.status === 'Completed' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                        }`}>
                          {apt.status === 'Completed' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                          {apt.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-8 text-right">
                        {apt.status === 'Scheduled' ? (
                           <Button size="sm" variant="outline" className="rounded-xl font-bold text-xs gap-1 hover:bg-success hover:text-white border-none bg-muted/50">
                              Complete
                           </Button>
                        ) : (
                           <span className="text-xs font-black text-muted-foreground uppercase tracking-widest italic opacity-50">Archived</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </div>
  );
}
