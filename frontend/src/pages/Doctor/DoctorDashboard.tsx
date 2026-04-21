import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { motion } from "framer-motion";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

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
      const statsRes = await fetch(`${API_BASE_URL}/api/doctor/stats`, {
        credentials: 'include'
      });
      const statsData = await statsRes.json();
      setStats(statsData);

      const consultationsRes = await fetch(`${API_BASE_URL}/api/doctor/consultations`, {
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
      color: "text-teal-600",
      bg: "bg-teal-50",
      border: "border-teal-100",
      glow: "shadow-teal-100/60",
      description: "Lifetime clinical interactions"
    },
    {
      title: "Pending Cases",
      value: stats?.pendingConsultations || 0,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      glow: "shadow-amber-100/60",
      description: "Awaiting medical review"
    },
    {
      title: "Completed",
      value: stats?.completedConsultations || 0,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      glow: "shadow-emerald-100/60",
      description: "Resolved patient cases"
    },
    {
      title: "Risk Alerts",
      value: stats?.highRiskAlerts || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100",
      glow: "shadow-red-100/60",
      description: "Critical high-risk cases"
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fdfe] relative overflow-x-hidden font-sans">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.12, 1], rotate: [0, 8, 0] }}
          transition={{ duration: 14, repeat: Infinity }}
          className="absolute -top-[15%] -right-[10%] w-[40%] h-[40%] bg-indigo-200/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, -6, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-[5%] -left-[8%] w-[35%] h-[35%] bg-teal-200/20 rounded-full blur-[100px]"
        />
      </div>

      <Sidebar variant="doctor" />

      <div className="flex-1 flex flex-col z-10 overflow-hidden">
        <Header
          title="Physician Portal"
          subtitle="Specialist medical overview and patient tracking"
        />

        <main className="flex-1 overflow-auto p-6 md:p-10 lg:p-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-10 pb-12"
          >
            {/* Stat Cards */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {statCards.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`bg-white rounded-[2.5rem] border-2 ${stat.border} p-7 shadow-xl ${stat.glow} relative overflow-hidden group`}
                >
                  <div className={`absolute -top-6 -right-6 w-24 h-24 ${stat.bg} rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`${stat.bg} p-3 rounded-2xl border ${stat.border}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div className={`w-2 h-2 rounded-full ${stat.bg.replace('bg-', 'bg-').replace('-50', '-400')} animate-pulse`} />
                    </div>
                    <h3 className="text-5xl font-black tracking-tighter text-gray-900 mb-2">
                      {isLoading ? (
                        <span className="inline-block w-12 h-10 bg-gray-100 rounded-2xl animate-pulse" />
                      ) : stat.value}
                    </h3>
                    <p className="text-sm font-black text-gray-700 mb-1">{stat.title}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{stat.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Main Content Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Consultations Table */}
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-50 p-2.5 rounded-2xl border border-indigo-100">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                      </div>
                      <h2 className="text-xl font-black text-gray-900 tracking-tight">Recent Consultations</h2>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-teal-600 font-black text-[10px] uppercase tracking-widest hover:bg-teal-50 rounded-2xl px-5 h-10 transition-all"
                      onClick={() => navigate('/doctor/consultations')}
                    >
                      View All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>

                  <div className="p-3">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-none hover:bg-transparent">
                          <TableHead className="px-6 py-4 font-black uppercase text-[9px] tracking-[0.15em] text-gray-400">Patient</TableHead>
                          <TableHead className="font-black uppercase text-[9px] tracking-[0.15em] text-gray-400">Purpose</TableHead>
                          <TableHead className="font-black uppercase text-[9px] tracking-[0.15em] text-gray-400">Status</TableHead>
                          <TableHead className="text-right px-6 font-black uppercase text-[9px] tracking-[0.15em] text-gray-400">View</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={4} className="h-32 text-center">
                              <div className="flex flex-col items-center gap-3 text-gray-300">
                                <Stethoscope className="h-10 w-10 animate-pulse opacity-30" />
                                <p className="text-xs font-black uppercase tracking-widest">Loading records...</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : recentConsultations.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="h-32 text-center">
                              <div className="flex flex-col items-center gap-3 text-gray-300">
                                <Calendar className="h-10 w-10 opacity-30" />
                                <p className="text-xs font-black uppercase tracking-widest">No consultations yet</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : recentConsultations.map((consult, i) => (
                          <motion.tr
                            key={consult._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="border-none hover:bg-teal-50/30 transition-colors group cursor-pointer"
                          >
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 text-base shadow-sm">
                                  {consult.patient?.name?.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-black text-gray-900 text-sm leading-none">{consult.patient?.name}</p>
                                  <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1 font-bold">MRN: {consult.patient?.mrn}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-bold text-sm text-gray-600">{consult.purpose || "—"}</span>
                            </TableCell>
                            <TableCell>
                              <Badge className={`rounded-2xl px-3 py-1 font-black text-[9px] uppercase tracking-wider border-none shadow-sm ${
                                consult.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                              }`}>
                                {consult.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right px-6">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="group-hover:text-teal-600 group-hover:bg-teal-50 transition-all rounded-xl"
                              >
                                <ChevronRight className="h-5 w-5" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </motion.div>

              {/* Side Panel */}
              <div className="space-y-6">
                {/* Practice Overview Card */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-200/60"
                >
                  <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/5 rounded-full blur-2xl" />
                  <div className="absolute bottom-0 right-0 p-6 opacity-[0.08]">
                    <TrendingUp className="h-28 w-28" />
                  </div>

                  <div className="relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest mb-5 border border-white/10">
                      <Activity className="h-3 w-3" />
                      Live Metrics
                    </div>
                    <h3 className="text-xl font-black tracking-tight mb-1">Practice Overview</h3>
                    <p className="text-white/60 text-xs mb-8 font-medium">Clinical performance for this month.</p>

                    <div className="space-y-5">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-bold text-white/80">Efficiency Rating</span>
                          <span className="font-black">94%</span>
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "94%" }}
                            transition={{ duration: 1.2, delay: 0.5 }}
                            className="h-full bg-white rounded-full"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-bold text-white/80">Response Time</span>
                          <span className="font-black">2.4h Avg</span>
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "78%" }}
                            transition={{ duration: 1.2, delay: 0.7 }}
                            className="h-full bg-white rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    <Button className="w-full mt-8 bg-white text-indigo-700 hover:bg-white/90 font-black rounded-[1.5rem] h-12 shadow-xl text-[10px] uppercase tracking-widest transition-all hover:-translate-y-0.5 active:scale-95">
                      Generate Report
                    </Button>
                  </div>
                </motion.div>

                {/* Clinical Alerts Card */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                    <div className="p-2.5 bg-red-50 rounded-2xl border border-red-100">
                      <Activity className="h-4 w-4 text-red-500" />
                    </div>
                    <h3 className="text-base font-black text-gray-900 tracking-tight">Clinical Alerts</h3>
                  </div>
                  <div className="p-6">
                    {stats?.highRiskAlerts > 0 ? (
                      <div className="flex items-start gap-4 p-5 bg-red-50 rounded-[1.5rem] border border-red-100">
                        <div className="p-2 bg-red-100 rounded-xl mt-0.5">
                          <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">Critical Risk Alert</p>
                          <p className="text-xs text-gray-500 mt-1 font-medium">{stats.highRiskAlerts} patients require immediate diagnostic review.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="h-16 w-16 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 flex items-center justify-center mb-4">
                          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                        </div>
                        <p className="text-sm font-black text-gray-900">All Clear</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-bold">No critical alerts detected</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}


