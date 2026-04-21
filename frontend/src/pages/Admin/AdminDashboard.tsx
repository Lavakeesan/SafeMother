import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { 
  Users, Calendar, AlertTriangle, Activity, 
  ArrowUpRight, ArrowDownRight, 
  TrendingUp, Clock, Shield, CheckCircle2,
  Stethoscope, UserCog
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";
import { motion } from "framer-motion";

const RISK_COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Low, Medium, High
const ROLE_COLORS = ['#6366f1', '#14b8a6', '#f43f5e', '#8b5cf6']; // Admin, Midwife, Patient, Doctor

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const riskData = stats ? [
    { name: 'Low Risk', value: stats.riskBreakdown.low },
    { name: 'Medium Risk', value: stats.riskBreakdown.medium },
    { name: 'High Risk', value: stats.riskBreakdown.high },
  ] : [];

  const userRoleData = stats?.userDistribution?.map((item: any) => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count
  })) || [];

  const registrationData = stats?.registrationTrends || [];

  return (
    <div className="flex min-h-screen bg-[#f8fdfe] font-sans relative overflow-x-hidden">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 6, 0] }}
          transition={{ duration: 14, repeat: Infinity }}
          className="absolute -top-[15%] -right-[10%] w-[40%] h-[40%] bg-indigo-200/20 rounded-full blur-[120px]"
        />
        <motion.div
           animate={{ scale: [1, 1.12, 1], rotate: [0, -5, 0] }}
           transition={{ duration: 12, repeat: Infinity }}
           className="absolute bottom-[5%] -left-[8%] w-[35%] h-[35%] bg-teal-200/20 rounded-full blur-[100px]"
        />
      </div>

      <Sidebar variant="admin" />

      <div className="flex-1 flex flex-col z-10 overflow-hidden">
        <Header title="Administration Overview" subtitle="System-wide monitoring and real-time metrics" />

        <main className="flex-1 overflow-auto p-6 md:p-10 lg:p-12 space-y-10">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Patients" 
              value={stats?.totalPatients || 0} 
              icon={Users} 
              trend="+12% Total" 
              trendType="up"
              color="text-teal-600"
              bg="bg-teal-50"
              shadow="shadow-teal-100/50"
            />
            <StatCard 
              title="Registered Midwifes" 
              value={stats?.totalMidwives || 0} 
              icon={Stethoscope} 
              trend="+2 Active" 
              trendType="up"
              color="text-indigo-600"
              bg="bg-indigo-50"
              shadow="shadow-indigo-100/50"
            />
            <StatCard 
              title="Total Appointments" 
              value={stats?.totalAppointments || 0} 
              icon={Calendar} 
              trend="Managed" 
              trendType="neutral"
              color="text-violet-600"
              bg="bg-violet-50"
              shadow="shadow-violet-100/50"
            />
            <StatCard 
              title="Alerts Triggered" 
              value={stats?.totalAlerts || 0} 
              icon={AlertTriangle} 
              trend="Pending" 
              trendType="warning"
              color="text-rose-600"
              bg="bg-rose-50"
              shadow="shadow-rose-100/50"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Registration Trends Graph */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="lg:col-span-2"
            >
               <Card className="border-none shadow-2xl shadow-gray-200/50 bg-white rounded-[2.5rem] overflow-hidden group">
                 <CardHeader className="p-10 pb-0">
                   <div className="flex items-center justify-between">
                     <div>
                       <CardTitle className="text-2xl font-black tracking-tighter text-gray-900 mb-1">Registration Trends</CardTitle>
                       <CardDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Monthly new user growth across the platform</CardDescription>
                     </div>
                     <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 group-hover:scale-110 transition-transform">
                       <TrendingUp className="h-6 w-6 text-indigo-600" />
                     </div>
                   </div>
                 </CardHeader>
                 <CardContent className="p-10 h-[420px]">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={registrationData}>
                       <defs>
                         <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                           <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                          dy={15} 
                       />
                       <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                       />
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                         itemStyle={{ color: '#6366f1', fontWeight: 900, fontSize: '14px' }}
                         labelStyle={{ fontWeight: 800, color: '#1e293b', marginBottom: '5px' }}
                       />
                       <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#6366f1" 
                          strokeWidth={4} 
                          fillOpacity={1} 
                          fill="url(#colorCount)" 
                          animationDuration={2000}
                       />
                     </AreaChart>
                   </ResponsiveContainer>
                 </CardContent>
               </Card>
            </motion.div>

            {/* Role Distribution Chart */}
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.2 }}
            >
               <Card className="border-none shadow-2xl shadow-gray-200/50 bg-white rounded-[2.5rem] h-full overflow-hidden">
                 <CardHeader className="p-10 pb-0">
                   <CardTitle className="text-2xl font-black tracking-tighter text-gray-900 mb-1">User Ecosystem</CardTitle>
                   <CardDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Active user distribution by role</CardDescription>
                 </CardHeader>
                 <CardContent className="p-10 h-[420px] flex flex-col items-center justify-between">
                   <ResponsiveContainer width="100%" height={260}>
                     <PieChart>
                       <Pie
                         data={userRoleData}
                         cx="50%"
                         cy="50%"
                         innerRadius={70}
                         outerRadius={100}
                         paddingAngle={10}
                         dataKey="value"
                       >
                         {userRoleData.map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip 
                          contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                       />
                     </PieChart>
                   </ResponsiveContainer>
                   
                   <div className="w-full grid grid-cols-2 gap-3 pt-6">
                      {userRoleData.map((item: any, idx: number) => (
                         <div key={item.name} className="flex flex-col p-3 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                               <div className="w-2 h-2 rounded-full" style={{backgroundColor: ROLE_COLORS[idx % ROLE_COLORS.length]}} />
                               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.name}</span>
                            </div>
                            <span className="text-xl font-black text-gray-900">{item.value}</span>
                         </div>
                      ))}
                   </div>
                 </CardContent>
               </Card>
            </motion.div>
          </div>

          {/* System Status Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
             <StatusCard 
                icon={CheckCircle2} 
                title="API Gateway" 
                subtitle="All clinical microservices online" 
                color="text-emerald-500" 
                bg="bg-emerald-50" 
             />
             <StatusCard 
                icon={Activity} 
                title="Sync Engine" 
                subtitle="Latest data pull: seconds ago" 
                color="text-indigo-500" 
                bg="bg-indigo-50" 
             />
             <StatusCard 
                icon={Shield} 
                title="Security Protocol" 
                subtitle="End-to-end encryption active" 
                color="text-amber-500" 
                bg="bg-amber-50" 
             />
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendType, color, bg, shadow }: any) {
  return (
    <motion.div
       whileHover={{ y: -5 }}
       className={`bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl ${shadow} transition-all`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className={`p-4 rounded-2xl ${bg}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
          trendType === 'up' ? 'bg-emerald-100 text-emerald-700' : 
          trendType === 'warning' ? 'bg-rose-100 text-rose-700' : 
          'bg-gray-100 text-gray-600'
        }`}>
          {trendType === 'up' && <ArrowUpRight className="h-3 w-3" />}
          {trendType === 'warning' && <AlertTriangle className="h-3 w-3" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{title}</p>
        <h3 className="text-4xl font-black tracking-tighter text-gray-900">{value}</h3>
      </div>
    </motion.div>
  );
}

function StatusCard({ icon: Icon, title, subtitle, color, bg }: any) {
   return (
      <Card className="border border-gray-100 shadow-xl shadow-gray-200/40 bg-white rounded-[2rem] overflow-hidden group">
         <CardContent className="p-7 flex items-center gap-5">
            <div className={`${bg} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
               <Icon className={`h-7 w-7 ${color}`} />
            </div>
            <div>
               <h4 className="font-black text-gray-900 leading-tight">{title}</h4>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{subtitle}</p>
            </div>
         </CardContent>
      </Card>
   );
}
