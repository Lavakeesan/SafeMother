import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope, Plus, Search, MapPin, Users,
  Award, Clock, Building2, MoreHorizontal,
  Mail, Phone, ExternalLink, Power, ShieldCheck,
  X, Save, UserPlus, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";


const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function AdminMidwifesPage() {
  const [midwifes, setMidwifes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Registration modal state
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contactNumber: "",
    assignedArea: "",
    qualification: "",
    experienceYears: "",
    hospitalName: ""
  });

  const fetchMidwifes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/midwifes`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMidwifes(data);
      }
    } catch (err) {
      toast.error("Failed to load midwifes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMidwifes();
  }, []);

  const toggleStatus = async (midwife: any) => {
    const newStatus = midwife.status === "Active" ? "Deactivated" : "Active";
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/midwifes/${midwife._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setMidwifes((prev) =>
          prev.map((m) => (m._id === midwife._id ? { ...m, status: newStatus } : m))
        );
        toast.success(`Midwife ${newStatus.toLowerCase()} successfully`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      return toast.error("Essential fields missing (Name, Email, Password)");
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: "midwife"
        }),
      });

      if (response.ok) {
        toast.success("Midwife registered successfully");
        setIsRegOpen(false);
        setFormData({
          name: "", email: "", password: "", contactNumber: "",
          assignedArea: "", qualification: "", experienceYears: "", hospitalName: ""
        });
        fetchMidwifes(); // Refresh list
      } else {
        const data = await response.json();
        toast.error(data.message || "Registration failed");
      }
    } catch (err) {
      toast.error("Network error during registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMidwifes = midwifes.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.hospital_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.assigned_area?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f8fdfe] font-sans relative overflow-x-hidden">
      {/* Ambient backgrounds */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -top-[10%] -right-[5%] w-[45%] h-[45%] bg-indigo-100/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, -4, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-teal-100/20 rounded-full blur-[120px]"
        />
      </div>

      <Sidebar variant="admin" />

      <div className="flex-1 flex flex-col z-10 overflow-hidden">
        <Header title="Midwife Registry" subtitle="Global oversight of community clinical staff" />

        <main className="flex-1 overflow-auto p-6 md:p-10 lg:p-12">
          {/* Top Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10"
          >
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search staff by name, hospital or area..."
                className="pl-12 h-13 rounded-[2rem] bg-white border-none shadow-lg shadow-indigo-100/40 font-bold text-gray-700 placeholder:text-gray-300 focus-visible:ring-indigo-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              onClick={() => setIsRegOpen(true)}
              className="h-12 px-6 rounded-[2rem] font-black gap-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200/50 text-[10px] uppercase tracking-widest transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Register Staff
            </Button>
          </motion.div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
               {Array(6).fill(0).map((_, i) => <div key={i} className="h-80 rounded-[2.5rem] bg-gray-100 animate-pulse" />)}
            </div>
          ) : filteredMidwifes.length === 0 ? (
            <div className="col-span-full h-96 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-20 w-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center">
                <Stethoscope className="h-10 w-10 text-indigo-200" />
              </div>
              <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No midwifes found in current directory</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
            >
              {filteredMidwifes.map((midwife) => {
                const isActive = midwife.status !== "Deactivated";
                return (
                  <motion.div
                    key={midwife._id}
                    variants={cardVariants}
                    whileHover={{ y: -6, scale: 1.01 }}
                    className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden group relative"
                  >
                    <CardContent className="p-0">
                      {/* Banner */}
                      <div className={`h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 relative transition-all duration-500 ${!isActive ? 'grayscale opacity-60' : ''}`}>
                         <div className="absolute top-4 right-4 flex items-center gap-2">
                            <div className={`flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-300 animate-pulse' : 'bg-red-400'}`} />
                              <span className="text-[9px] font-black text-white uppercase tracking-widest">
                                {midwife.status || 'Active'}
                              </span>
                            </div>
                            <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                  <button className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                     <MoreHorizontal className="h-4 w-4 text-white" />
                                  </button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end" className="rounded-2xl p-2 w-52 shadow-2xl border-none">
                                  <DropdownMenuItem className="gap-2.5 font-bold cursor-pointer rounded-xl h-11 text-xs px-4 text-gray-600">
                                     <MapPin className="h-4 w-4 text-indigo-500" />
                                     Modify Assignment
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2.5 font-bold cursor-pointer rounded-xl h-11 text-xs px-4 text-gray-600">
                                     <Users className="h-4 w-4 text-indigo-500" />
                                     Review Caseload
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => toggleStatus(midwife)}
                                    className={`gap-2.5 font-black cursor-pointer rounded-xl h-11 text-xs px-4 ${isActive ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100'}`}
                                  >
                                     <Power className="h-4 w-4" />
                                     {isActive ? "Deactivate Account" : "Activate Account"}
                                  </DropdownMenuItem>
                               </DropdownMenuContent>
                            </DropdownMenu>
                         </div>
                      </div>

                      <div className="px-7 pb-7 relative">
                        {/* Avatar */}
                        <div className="absolute -top-10 left-6">
                           <Avatar className={`h-20 w-20 border-4 border-white shadow-xl ring-2 ring-gray-100/50 transition-all ${!isActive ? 'grayscale opacity-70' : ''}`}>
                              {midwife.hasProfilePhoto && (
                                <AvatarImage src={`${API_BASE_URL}/api/users/profile-photo/${midwife.user_id?._id || midwife.user_id}`} />
                              )}
                              <AvatarFallback className="bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 text-2xl font-black">
                                 {midwife.name.charAt(0)}
                              </AvatarFallback>
                           </Avatar>
                        </div>

                        <div className="pt-12">
                           <div className="flex items-start justify-between">
                              <div>
                                 <h3 className={`text-lg font-black tracking-tight leading-none ${!isActive ? 'text-gray-400' : 'text-gray-900'}`}>{midwife.name}</h3>
                                 <div className="flex items-center gap-1.5 mt-2">
                                    <Building2 className={`h-3 w-3 ${isActive ? 'text-indigo-400' : 'text-gray-300'}`} />
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-gray-400' : 'text-gray-300'}`}>
                                       {midwife.hospital_name || "Unassigned Clinic"}
                                    </p>
                                 </div>
                              </div>
                              <Badge className={`rounded-[0.75rem] px-3 py-1 font-black text-[9px] uppercase tracking-widest border-none ${isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-300'}`}>
                                 Midwife
                              </Badge>
                           </div>

                           <div className="grid grid-cols-2 gap-3 mt-6">
                              <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                                 <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Region</p>
                                 <div className="flex items-center gap-1.5 font-bold text-xs text-gray-700">
                                    <MapPin className={`h-3.5 w-3.5 ${isActive ? 'text-teal-500' : 'text-gray-300'}`} />
                                    <span className={!isActive ? 'text-gray-400' : 'truncate'}>{midwife.assigned_area || "N/A"}</span>
                                 </div>
                              </div>
                              <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                                 <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Service</p>
                                 <div className="flex items-center gap-1.5 font-bold text-xs text-gray-700">
                                    <Award className={`h-3.5 w-3.5 ${isActive ? 'text-amber-500' : 'text-gray-300'}`} />
                                    <span className={!isActive ? 'text-gray-400' : ''}>{midwife.experience_years ? `${midwife.experience_years} Y` : "—"}</span>
                                 </div>
                              </div>
                           </div>

                           <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                              <div className="flex gap-2.5">
                                 <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${isActive ? 'bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600' : 'bg-gray-100 text-gray-300'}`}>
                                    <Mail className="h-4 w-4" />
                                 </div>
                                 <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${isActive ? 'bg-gray-50 text-gray-400 hover:bg-teal-50 hover:text-teal-600' : 'bg-gray-100 text-gray-300'}`}>
                                    <Phone className="h-4 w-4" />
                                 </div>
                              </div>
                              
                              <Button
                                size="sm"
                                variant={isActive ? "destructive" : "default"}
                                onClick={() => toggleStatus(midwife)}
                                className={`h-10 px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-gray-100 transition-all active:scale-95 ${
                                  isActive
                                    ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100'
                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100'
                                }`}
                              >
                                {isActive ? "Deactivate" : "Activate"}
                              </Button>
                           </div>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </main>
      </div>

      {/* ── Registration Modal ────────────────────────────────────────────────── */}
      <Dialog open={isRegOpen} onOpenChange={setIsRegOpen}>
        <DialogContent className="sm:max-w-2xl rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden font-sans max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-10 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl font-sans" />
            <div className="flex items-center gap-4 relative">
              <div className="p-3 bg-white/15 rounded-[1.25rem] border border-white/20">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-white tracking-tight">Register New Staff</DialogTitle>
                <DialogDescription className="text-white/60 text-xs font-medium mt-1">
                  Create a professional profile for a community midwife
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handleRegister} className="p-10 space-y-8 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Full Name</Label>
                <div className="relative">
                   <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                   <Input
                    required
                    placeholder="e.g. Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-12 pl-12 rounded-2xl bg-gray-50 border-gray-100 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Email Address</Label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                   <Input
                    required
                    type="email"
                    placeholder="jane@safemother.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="h-12 pl-12 rounded-2xl bg-gray-50 border-gray-100 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Access Password</Label>
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                   <Input
                    required
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="h-12 pl-12 rounded-2xl bg-gray-50 border-gray-100 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Contact Phone</Label>
                <div className="relative">
                   <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                   <Input
                    placeholder="+94 77 XXX XXXX"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    className="h-12 pl-12 rounded-2xl bg-gray-50 border-gray-100 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Assigned Region</Label>
                <div className="relative">
                   <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                   <Input
                    placeholder="e.g. Colombo District"
                    value={formData.assignedArea}
                    onChange={(e) => setFormData({...formData, assignedArea: e.target.value})}
                    className="h-12 pl-12 rounded-2xl bg-gray-50 border-gray-100 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Affiliated Hospital</Label>
                <div className="relative">
                   <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                   <Input
                    placeholder="National Hospital"
                    value={formData.hospitalName}
                    onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
                    className="h-12 pl-12 rounded-2xl bg-gray-50 border-gray-100 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Clinical Qualification</Label>
                <div className="relative">
                   <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                   <Input
                    placeholder="BSc Nursing / Midwifery"
                    value={formData.qualification}
                    onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                    className="h-12 pl-12 rounded-2xl bg-gray-50 border-gray-100 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Experience (Years)</Label>
                <div className="relative">
                   <Award className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                   <Input
                    type="number"
                    placeholder="5"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({...formData, experienceYears: e.target.value})}
                    className="h-12 pl-12 rounded-2xl bg-gray-50 border-gray-100 font-bold text-sm font-sans"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsRegOpen(false)}
                className="flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-gray-100 hover:bg-gray-50 transition-all font-sans"
              >
                Discard
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 transition-all active:scale-95 font-sans"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Register Staff
                  </div>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
