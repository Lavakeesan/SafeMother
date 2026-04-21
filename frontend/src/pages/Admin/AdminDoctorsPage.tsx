import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { motion } from "framer-motion";
import {
  Stethoscope,
  Search,
  Mail,
  Phone,
  Building2,
  Award,
  UserCog,
  ClipboardList,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } }
};

// Gradient themes cycle for variety
const CARD_GRADIENTS = [
  "from-indigo-500 to-indigo-700",
  "from-teal-500 to-teal-700",
  "from-violet-500 to-purple-700",
  "from-sky-500 to-cyan-700",
  "from-emerald-500 to-green-700",
  "from-rose-500 to-pink-700",
];

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctor`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      } else {
        toast.error("Failed to fetch doctors");
      }
    } catch (err) {
      toast.error("Network error: could not load doctors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.hospital_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.email && d.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleStatus = async (doctor: any) => {
    const newStatus = doctor.status === "Active" ? "Deactivated" : "Active";
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctor/${doctor._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setDoctors((prev) =>
          prev.map((d) => (d._id === doctor._id ? { ...d, status: newStatus } : d))
        );
        toast.success(`Doctor ${newStatus.toLowerCase()} successfully`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

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
        <Header
          title="Doctor Registry"
          subtitle="Full directory of registered physicians and specialists"
        />

        <main className="flex-1 overflow-auto p-6 md:p-10 lg:p-12">
          {/* Top bar */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10"
          >
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, specialization, hospital..."
                className="pl-12 h-13 rounded-[2rem] bg-white border-none shadow-lg shadow-gray-100/70 font-bold text-gray-700 placeholder:text-gray-300 focus-visible:ring-indigo-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 px-5 py-3 bg-indigo-50 rounded-[2rem] border border-indigo-100">
              <ClipboardList className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-black text-indigo-700 uppercase tracking-widest">
                {filteredDoctors.length} Physicians
              </span>
            </div>
          </motion.div>

          {/* Doctor Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-72 rounded-[2.5rem] bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="h-24 w-24 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-center justify-center mb-6">
                <Stethoscope className="h-12 w-12 text-indigo-200" />
              </div>
              <p className="text-xl font-black text-gray-300 uppercase tracking-widest mb-2">No Doctors Found</p>
              <p className="text-sm text-gray-400 font-medium">
                {searchQuery ? "No results match your search." : "No physicians have been registered yet."}
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredDoctors.map((doctor, index) => {
                const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
                const isActive = doctor.status !== "Deactivated";
                return (
                  <motion.div
                    key={doctor._id}
                    variants={cardVariants}
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden group"
                  >
                    {/* Card header banner */}
                    <div className={`h-28 bg-gradient-to-br ${gradient} relative flex-shrink-0 transition-opacity duration-500 ${!isActive ? 'opacity-50 grayscale' : ''}`}>
                      {/* Decorative circle */}
                      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
                      <div className="absolute top-4 right-4">
                        <div className={`flex items-center gap-1.5 px-3 py-1 backdrop-blur-sm rounded-full border ${
                          isActive 
                            ? 'bg-white/15 border-white/20' 
                            : 'bg-red-500/20 border-red-500/30'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                          <span className="text-[9px] font-black text-white uppercase tracking-widest">
                            {doctor.status || 'Active'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-7 pb-7 relative">
                      {/* Avatar overlapping banner */}
                      <div className="absolute -top-10 left-6">
                        <Avatar className={`h-20 w-20 border-4 border-white shadow-xl ring-2 ring-gray-100/60 transition-transform ${!isActive ? 'grayscale opacity-70' : ''}`}>
                          <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white text-2xl font-black`}>
                            {doctor.name?.charAt(0) ?? "D"}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="pt-12 space-y-4">
                        {/* Name & role */}
                        <div>
                          <h3 className={`text-lg font-black text-gray-900 tracking-tight leading-none ${!isActive ? 'text-gray-400' : ''}`}>{doctor.name}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border-none ${
                              isActive ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-400'
                            }`}>
                              <GraduationCap className="h-3 w-3 mr-1 inline" />
                              {doctor.specialization || "General Physician"}
                            </Badge>
                          </div>
                        </div>

                        {/* Detail grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Hospital</p>
                            <div className="flex items-center gap-1.5">
                              <Building2 className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? 'text-indigo-500' : 'text-gray-300'}`} />
                              <p className={`text-xs font-black truncate ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                                {doctor.hospital_name || "Unassigned"}
                              </p>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Experience</p>
                            <div className="flex items-center gap-1.5">
                              <Award className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? 'text-amber-500' : 'text-gray-300'}`} />
                              <p className={`text-xs font-black ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                                {doctor.experience_years ? `${doctor.experience_years} Yrs` : "—"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action strip */}
                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-1">
                             {doctor.email && (
                              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-300">
                                <Mail className="h-3.5 w-3.5" />
                              </div>
                             )}
                             <p className="text-[10px] font-bold text-gray-400 truncate">{doctor.email}</p>
                          </div>
                          
                          <Button
                            size="sm"
                            variant={isActive ? "destructive" : "default"}
                            onClick={() => toggleStatus(doctor)}
                            className={`h-9 px-4 rounded-[1.25rem] text-[9px] font-black uppercase tracking-widest transition-all ${
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
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
