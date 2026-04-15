import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { 
  AlertTriangle, Search, Bell, ShieldAlert,
  Send, Clock, CheckCircle2, User, 
  MapPin, MessageSquare, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`http://${window.location.hostname}:5001/api/alerts`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (err) {
      toast.error("Failed to load alerts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter(a => 
    a.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.patient_id?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar variant="admin" />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header title="Emergency Alert Hub" subtitle="Real-time monitoring of critical maternal notifications" />

        <main className="flex-1 overflow-auto p-8 bg-muted/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search alerts by clinical message or patient name..." 
                className="pl-10 h-12 rounded-2xl bg-card border-none shadow-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button className="h-12 px-6 rounded-2xl font-bold gap-2 bg-emergency text-white hover:bg-emergency/90">
              <Bell className="h-5 w-5 animate-pulse" />
              Broadcast Emergency
            </Button>
          </div>

          <div className="bg-card rounded-3xl border-none shadow-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-none">
                  <TableHead className="py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Alert Signature</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Affected Patient</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Timestamp</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell colSpan={5} className="h-20 bg-muted/10 border-none" />
                    </TableRow>
                  ))
                ) : filteredAlerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-muted-foreground italic">
                       <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-10" />
                       No critical alerts currently active in the system
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAlerts.map((alert) => (
                    <TableRow key={alert._id} className="group hover:bg-muted/10 border-muted/20 transition-colors">
                      <TableCell className="py-4 px-8 max-w-md">
                        <div className="flex items-start gap-3">
                           <div className={`p-2 rounded-xl mt-1 ${alert.status === 'Sent' ? 'bg-success/10 text-success' : 'bg-emergency/10 text-emergency'}`}>
                              <AlertCircle className="h-5 w-5" />
                           </div>
                           <div>
                              <p className="font-bold text-sm text-foreground line-clamp-2">{alert.message}</p>
                              <div className="flex items-center gap-1.5 mt-1 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                                 <Send className="h-3 w-3" />
                                 {alert.type || "System Broadcast"}
                              </div>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary font-black text-xs">
                              {alert.patient_id?.name ? alert.patient_id.name.charAt(0) : <User className="h-4 w-4" />}
                           </div>
                           <p className="text-sm font-bold text-foreground">{alert.patient_id?.name || "Global"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                           <span className="text-xs font-bold text-foreground">{new Date(alert.createdAt).toLocaleDateString()}</span>
                           <span className="text-[10px] font-black text-muted-foreground uppercase">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`rounded-xl border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 ${
                          alert.status === 'Sent' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}>
                          {alert.status === 'Sent' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                          {alert.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-8 text-right">
                        <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs border-none bg-muted/50 hover:bg-primary hover:text-white transition-all">
                           Investigate
                        </Button>
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
