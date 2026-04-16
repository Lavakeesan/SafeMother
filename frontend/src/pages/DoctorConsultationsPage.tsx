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
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function DoctorConsultationsPage() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const resp = await fetch(`http://${window.location.hostname}:5001/api/doctor/consultations`, {
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
                          c.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700 animate-pulse'
                       }`}>
                          {c.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right py-5 px-8">
                       <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                             <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button className="h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-primary text-white shadow-lg shadow-primary/20 gap-2 hover:scale-[1.05] transition-all">
                             <CheckCircle2 className="h-3.5 w-3.5" />
                             Finalize
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </div>
  );
}
