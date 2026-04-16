import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Stethoscope,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [recentConsultations, setRecentConsultations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await fetch(`http://${window.location.hostname}:5001/api/doctor/stats`, {
        credentials: 'include'
      });
      const statsData = await statsRes.json();
      setStats(statsData);

      const consultationsRes = await fetch(`http://${window.location.hostname}:5001/api/doctor/consultations`, {
        credentials: 'include'
      });
      const consultationsData = await consultationsRes.json();
      setRecentConsultations(consultationsData.slice(0, 5));
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Consultations",
      value: stats?.totalConsultations || 0,
      icon: Stethoscope,
      color: "text-primary",
      bg: "bg-primary/10",
      description: "Lifetime clinical interactions"
    },
    {
      title: "Pending Cases",
      value: stats?.pendingConsultations || 0,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-100",
      description: "Awaiting medical review"
    },
    {
      title: "Completed",
      value: stats?.completedConsultations || 0,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      description: "Resolved patient cases"
    },
    {
      title: "Risk Alerts",
      value: stats?.highRiskAlerts || 0,
      icon: AlertTriangle,
      color: "text-emergency",
      bg: "bg-emergency/10",
      description: "Critical high-risk cases"
    }
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar variant="doctor" />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header 
          title="Physician Portal" 
          subtitle="Specialist medical overview and patient tracking" 
        />

        <main className="flex-1 overflow-auto p-8 bg-muted/20">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <Card key={index} className="border-none shadow-xl rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.bg} p-3 rounded-2xl`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <Badge variant="outline" className="rounded-lg border-muted-foreground/20 text-[10px] uppercase font-black tracking-widest">
                      Live
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-4xl font-black tracking-tighter text-foreground mb-1">
                      {isLoading ? "..." : stat.value}
                    </h3>
                    <p className="text-sm font-bold text-foreground/80">{stat.title}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Consultations */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-[2.5rem] shadow-xl border-none overflow-hidden">
                <div className="p-8 border-b border-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-xl">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-black tracking-tight">Recent Consultations</h2>
                  </div>
                  <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 rounded-xl">
                    View All
                  </Button>
                </div>
                <div className="p-2">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Patient</TableHead>
                        <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Purpose</TableHead>
                        <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Status</TableHead>
                        <TableHead className="text-right px-6 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">Loading consultations...</TableCell>
                        </TableRow>
                      ) : recentConsultations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">No recent consultations found.</TableCell>
                        </TableRow>
                      ) : recentConsultations.map((consult) => (
                        <TableRow key={consult._id} className="border-none hover:bg-muted/30 transition-colors group">
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center font-black text-primary">
                                {consult.patient?.name?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-foreground leading-none">{consult.patient?.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">MRN: {consult.patient?.mrn}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-sm">{consult.purpose}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`rounded-xl px-3 py-1 font-bold text-[10px] uppercase tracking-tighter ${
                              consult.status === 'Completed' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-amber-100 text-amber-700'
                            }`}>
                              {consult.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right px-6">
                            <Button variant="ghost" size="icon" className="group-hover:text-primary transition-colors">
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Side Panel: System Metrics & Health */}
            <div className="space-y-6">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-indigo-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <TrendingUp className="h-32 w-32" />
                </div>
                <CardContent className="p-8 relative">
                  <h3 className="text-lg font-black tracking-tight mb-2">Practice Overview</h3>
                  <p className="text-white/70 text-sm mb-6">Your clinical performance metrics for the current billing month.</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold opacity-80">Efficiency Rating</span>
                      <span className="font-black">94%</span>
                    </div>
                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-[94%]" />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm pt-2">
                      <span className="font-bold opacity-80">Response Time</span>
                      <span className="font-black">2.4h Avg</span>
                    </div>
                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-[78%]" />
                    </div>
                  </div>

                  <Button className="w-full mt-8 bg-white text-indigo-600 hover:bg-white/90 font-black rounded-2xl h-12 shadow-xl">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-muted/30 p-6 border-b border-muted/20">
                  <CardTitle className="text-base font-black tracking-tight flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Clinical Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                   <div className="space-y-4">
                      {stats?.highRiskAlerts > 0 ? (
                        <div className="flex items-start gap-3 p-4 bg-emergency/5 rounded-2xl border border-emergency/10 group">
                           <AlertTriangle className="h-5 w-5 text-emergency animate-pulse" />
                           <div>
                              <p className="text-sm font-black text-foreground">Critical Risk Alert</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{stats.highRiskAlerts} patients require immediate diagnostic review.</p>
                           </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                           <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
                           <p className="text-sm font-bold">All clear</p>
                           <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">No critical alerts detected</p>
                        </div>
                      )}
                   </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
