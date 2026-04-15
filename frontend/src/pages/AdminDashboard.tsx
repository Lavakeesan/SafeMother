import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { 
  Users, Calendar, AlertTriangle, Activity, 
  ArrowUpRight, ArrowDownRight, 
  TrendingUp, Clock, Shield, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Low, Medium, High

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`http://${window.location.hostname}:5001/api/admin/stats`, {
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

  const registrationData = [
    { month: 'Jan', count: 45 },
    { month: 'Feb', count: 52 },
    { month: 'Mar', count: 38 },
    { month: 'Apr', count: 65 },
    { month: 'May', count: 48 },
    { month: 'Jun', count: 59 },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      <Sidebar variant="admin" />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header title="Administration Overview" subtitle="System-wide monitoring and metrics" />

        <main className="flex-1 overflow-auto p-8 space-y-8 bg-muted/20">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Patients" 
              value={stats?.totalPatients || 0} 
              icon={Users} 
              trend="+12% from last month" 
              trendType="up"
              color="text-primary"
              bg="bg-primary/10"
            />
            <StatCard 
              title="Total Midwives" 
              value={stats?.totalMidwives || 0} 
              icon={Shield} 
              trend="+2 new this week" 
              trendType="up"
              color="text-indigo-600"
              bg="bg-indigo-100"
            />
            <StatCard 
              title="Total Appointments" 
              value={stats?.totalAppointments || 0} 
              icon={Calendar} 
              trend="-5% from last week" 
              trendType="down"
              color="text-amber-600"
              bg="bg-amber-100"
            />
            <StatCard 
              title="Critical Alerts" 
              value={stats?.totalAlerts || 0} 
              icon={AlertTriangle} 
              trend="3 urgent pending" 
              trendType="warning"
              color="text-emergency"
              bg="bg-emergency/10"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Graph */}
            <Card className="lg:col-span-2 border-none shadow-xl bg-card rounded-3xl overflow-hidden">
              <CardHeader className="p-8 pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black tracking-tight">Registration Trends</CardTitle>
                    <CardDescription className="font-medium">Monthly new user registrations for 2024</CardDescription>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={registrationData}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 700 }}
                    />
                    <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Distribution */}
            <Card className="border-none shadow-xl bg-card rounded-3xl overflow-hidden">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-black tracking-tight">Patient Risk Distribution</CardTitle>
                <CardDescription className="font-medium">Active cases by clinical risk level</CardDescription>
              </CardHeader>
              <CardContent className="p-8 h-[400px] flex flex-col items-center justify-between">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="w-full space-y-4 pt-4">
                   {riskData.map((item, idx) => (
                      <div key={item.name} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30">
                         <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[idx]}} />
                            <span className="text-sm font-bold">{item.name}</span>
                         </div>
                         <span className="text-sm font-black text-primary">{item.value}</span>
                      </div>
                   ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <Card className="border-none shadow-lg bg-card rounded-3xl">
                <CardContent className="p-6 flex items-center gap-4">
                   <div className="bg-success/10 p-4 rounded-2xl">
                      <CheckCircle2 className="h-8 w-8 text-success" />
                   </div>
                   <div>
                      <h4 className="font-bold text-foreground">API Integrity</h4>
                      <p className="text-sm text-muted-foreground font-medium">99.9% uptime - All services active</p>
                   </div>
                </CardContent>
             </Card>
             <Card className="border-none shadow-lg bg-card rounded-3xl">
                <CardContent className="p-6 flex items-center gap-4">
                   <div className="bg-primary/10 p-4 rounded-2xl">
                      <Activity className="h-8 w-8 text-primary" />
                   </div>
                   <div>
                      <h4 className="font-bold text-foreground">Cloud Sync</h4>
                      <p className="text-sm text-muted-foreground font-medium">Last sync: 2 mins ago</p>
                   </div>
                </CardContent>
             </Card>
             <Card className="border-none shadow-lg bg-card rounded-3xl">
                <CardContent className="p-6 flex items-center gap-4">
                   <div className="bg-emergency/10 p-4 rounded-2xl">
                      <Clock className="h-8 w-8 text-emergency" />
                   </div>
                   <div>
                      <h4 className="font-bold text-foreground">Maintenance</h4>
                      <p className="text-sm text-muted-foreground font-medium">Next window: Sunday 2 AM</p>
                   </div>
                </CardContent>
             </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendType, color, bg }: any) {
  return (
    <Card className="border-none shadow-lg bg-card rounded-3xl transition-transform hover:scale-[1.02] duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-2xl ${bg}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
            trendType === 'up' ? 'bg-success/10 text-success' : 
            trendType === 'down' ? 'bg-emergency/10 text-emergency' : 
            'bg-warning/10 text-warning'
          }`}>
            {trendType === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-muted-foreground text-xs font-black uppercase tracking-widest leading-none">{title}</p>
          <h3 className="text-4xl font-black mt-1 text-foreground">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
