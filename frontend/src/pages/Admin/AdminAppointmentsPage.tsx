import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Search, Filter, Clock,
  MapPin, User, Stethoscope, CheckCircle2,
  CalendarCheck, AlertCircle, CalendarDays,
  Pencil, Trash2, X, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<any>(null);
  const [editDate, setEditDate] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editPurpose, setEditPurpose] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirm state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingApt, setDeletingApt] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
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

  // ─── Update ───────────────────────────────────────────────────────────────
  const openEdit = (apt: any) => {
    setEditingApt(apt);
    // Format date for datetime-local input
    const date = new Date(apt.appointmentDate);
    const formattedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setEditDate(formattedDate);
    setEditStatus(apt.status);
    setEditPurpose(apt.purpose || "");
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editDate) return toast.error("Please select a date and time");
    setIsSaving(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/appointments/${editingApt._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            appointmentDate: editDate,
            status: editStatus,
            purpose: editPurpose
          }),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        // The updated object from backend might not have populated fields, so we merge carefully
        setAppointments((prev) =>
          prev.map((a) => (a._id === updated._id ? { ...a, ...updated } : a))
        );
        toast.success("Appointment updated");
        setIsEditOpen(false);
        // Refresh to get full populated data if needed, or just assume in-place update is enough for now
        fetchAppointments(); 
      } else {
        toast.error("Failed to update appointment");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const openDelete = (apt: any) => {
    setDeletingApt(apt);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/appointments/${deletingApt._id}`,
        { method: "DELETE", credentials: "include" }
      );
      if (res.ok) {
        setAppointments((prev) => prev.filter((a) => a._id !== deletingApt._id));
        toast.success("Appointment removed");
        setIsDeleteOpen(false);
      } else {
        toast.error("Failed to delete appointment");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fdfe] font-sans relative overflow-x-hidden text-foreground">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 14, repeat: Infinity }}
          className="absolute -top-[15%] -right-[10%] w-[40%] h-[40%] bg-blue-200/15 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.12, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-[5%] -left-[8%] w-[35%] h-[35%] bg-teal-200/15 rounded-full blur-[100px]"
        />
      </div>

      <Sidebar variant="admin" />

      <div className="flex-1 flex flex-col z-10 overflow-hidden">
        <Header
          title="Appointment Hub"
          subtitle="Manage maternal clinical consultations and schedules"
        />

        <main className="flex-1 overflow-auto p-6 md:p-10 lg:p-12">
          {/* Top Bar */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10"
          >
            <div className="flex flex-1 items-center gap-4 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search patients or midwives..."
                  className="pl-12 h-13 rounded-[2rem] bg-white border-none shadow-lg shadow-gray-100/70 font-bold text-gray-700 placeholder:text-gray-300 focus-visible:ring-blue-400 font-sans"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-[2rem] shadow-lg shadow-gray-100/70 border-none">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <select
                  className="bg-transparent text-sm font-black text-gray-700 outline-none cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Any Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <Button className="h-12 px-6 rounded-[2rem] font-black gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200/60 text-[10px] uppercase tracking-widest transition-all active:scale-95">
              <CalendarCheck className="h-4 w-4" />
              New Entry
            </Button>
          </motion.div>

          {/* Appointments Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden"
          >
            <Table>
              <TableHeader className="bg-gray-50/70">
                <TableRow className="border-none">
                  <TableHead className="py-5 px-8 font-black uppercase tracking-[0.15em] text-[10px] text-gray-400">Date & Timeline</TableHead>
                  <TableHead className="font-black uppercase tracking-[0.15em] text-[10px] text-gray-400">Patient</TableHead>
                  <TableHead className="font-black uppercase tracking-[0.15em] text-[10px] text-gray-400">Midwife</TableHead>
                  <TableHead className="font-black uppercase tracking-[0.15em] text-[10px] text-gray-400">Status</TableHead>
                  <TableHead className="text-right py-5 px-8 font-black uppercase tracking-[0.15em] text-[10px] text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="border-none animate-pulse">
                      <TableCell colSpan={5} className="h-20 bg-gray-50/50" />
                    </TableRow>
                  ))
                ) : filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-20 w-20 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center justify-center">
                          <Calendar className="h-10 w-10 text-gray-200" />
                        </div>
                        <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No appointments found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((apt, i) => (
                    <motion.tr
                      key={apt._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-none hover:bg-blue-50/20 transition-colors group"
                    >
                      <TableCell className="py-5 px-8">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 p-2.5 rounded-2xl border border-blue-100">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-black text-sm text-gray-800 leading-none">
                              {new Date(apt.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                              {new Date(apt.appointmentDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
                            {apt.patient?.name?.charAt(0) || <User className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800 leading-none">{apt.patient?.name}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">MRN: {apt.patient?.mrn || "N/A"}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 font-black">
                            <Stethoscope className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800 leading-none">{apt.midwife?.name}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 truncate max-w-[120px]">
                              {apt.midwife?.hospital_name || "Unassigned"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge className={`rounded-2xl border-none font-black text-[9px] uppercase tracking-widest px-3 py-1.5 inline-flex items-center gap-1 shadow-sm ${
                          apt.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {apt.status === 'Completed' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {apt.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEdit(apt)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Update
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openDelete(apt)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </motion.button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </motion.div>
        </main>
      </div>

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden font-sans">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="flex items-center gap-3 relative">
              <div className="p-2.5 bg-white/15 rounded-2xl border border-white/20">
                <CalendarCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-white tracking-tight">Modify Appointment</DialogTitle>
                <DialogDescription className="text-white/60 text-xs font-medium mt-0.5">
                  Update time, purpose or clinical status
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6 bg-white">
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Date & Time</Label>
              <Input
                type="datetime-local"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="h-12 rounded-2xl bg-gray-50 border-gray-100 font-bold text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Purpose of Visit</Label>
              <textarea
                value={editPurpose}
                onChange={(e) => setEditPurpose(e.target.value)}
                rows={3}
                className="w-full rounded-2xl bg-gray-50 border border-gray-100 p-4 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-blue-400/30 outline-none resize-none transition-all"
                placeholder="Details of the consultation..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Status</Label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm font-black text-gray-800 outline-none focus:ring-2 focus:ring-blue-400/30 transition-all cursor-pointer"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setIsEditOpen(false)}
                className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-gray-100 hover:bg-gray-50 transition-all"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={isSaving}
                className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200/60 transition-all active:scale-95"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Syncing..." : "Apply Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Modal ────────────────────────────────────────────────── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden font-sans">
          <div className="bg-gradient-to-br from-red-500 to-red-700 p-8 relative">
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
            <div className="flex items-center gap-3 relative">
              <div className="p-2.5 bg-white/15 rounded-2xl border border-white/20">
                <Trash2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-white tracking-tight">Delete Record</DialogTitle>
                <DialogDescription className="text-white/60 text-xs font-medium mt-0.5">
                  This action will permanently purge the entry
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white space-y-6">
            <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Patient</p>
                  <p className="text-sm font-bold text-gray-800">{deletingApt?.patient?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Date</p>
                  <p className="text-sm font-bold text-gray-800">
                    {deletingApt && new Date(deletingApt.appointmentDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 font-medium text-center">
              Are you sure you want to delete this clinical appointment?
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-gray-100 hover:bg-gray-50 transition-all font-sans"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200/60 transition-all active:scale-95 font-sans"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Purging..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
