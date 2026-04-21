import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Search, Bell, ShieldAlert,
  Send, Clock, CheckCircle2, User,
  AlertCircle, Pencil, Trash2, X, Save
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

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<any>(null);
  const [editMessage, setEditMessage] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirm state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingAlert, setDeletingAlert] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/alerts`, {
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

  // ─── Update ───────────────────────────────────────────────────────────────
  const openEdit = (alert: any) => {
    setEditingAlert(alert);
    setEditMessage(alert.message);
    setEditStatus(alert.status);
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editMessage.trim()) return toast.error("Message cannot be empty");
    setIsSaving(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/alerts/${editingAlert._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ message: editMessage, status: editStatus }),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        setAlerts((prev) =>
          prev.map((a) => (a._id === updated._id ? { ...a, ...updated } : a))
        );
        toast.success("Alert updated successfully");
        setIsEditOpen(false);
      } else {
        toast.error("Failed to update alert");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const openDelete = (alert: any) => {
    setDeletingAlert(alert);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/alerts/${deletingAlert._id}`,
        { method: "DELETE", credentials: "include" }
      );
      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a._id !== deletingAlert._id));
        toast.success("Alert deleted");
        setIsDeleteOpen(false);
      } else {
        toast.error("Failed to delete alert");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fdfe] font-sans relative overflow-x-hidden">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 14, repeat: Infinity }}
          className="absolute -top-[15%] -right-[10%] w-[40%] h-[40%] bg-red-200/15 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.12, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-[5%] -left-[8%] w-[35%] h-[35%] bg-indigo-200/15 rounded-full blur-[100px]"
        />
      </div>

      <Sidebar variant="admin" />

      <div className="flex-1 flex flex-col z-10 overflow-hidden">
        <Header
          title="Emergency Alert Hub"
          subtitle="Real-time monitoring of critical maternal notifications"
        />

        <main className="flex-1 overflow-auto p-6 md:p-10 lg:p-12">
          {/* Top bar */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search alerts by clinical message or patient name..."
                className="pl-12 h-13 rounded-[2rem] bg-white border-none shadow-lg shadow-gray-100/70 font-bold text-gray-700 placeholder:text-gray-300 focus-visible:ring-red-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-5 py-3 bg-red-50 rounded-[2rem] border border-red-100">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-xs font-black text-red-600 uppercase tracking-widest">
                  {filteredAlerts.length} Alerts
                </span>
              </div>
              <Button className="h-12 px-6 rounded-[2rem] font-black gap-2 bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200/60 text-[10px] uppercase tracking-widest transition-all active:scale-95">
                <Bell className="h-4 w-4 animate-pulse" />
                Broadcast Emergency
              </Button>
            </div>
          </motion.div>

          {/* Alerts Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden"
          >
            <Table>
              <TableHeader className="bg-gray-50/70">
                <TableRow className="border-none">
                  <TableHead className="py-5 px-8 font-black uppercase tracking-[0.15em] text-[9px] text-gray-400">Alert Message</TableHead>
                  <TableHead className="font-black uppercase tracking-[0.15em] text-[9px] text-gray-400">Patient</TableHead>
                  <TableHead className="font-black uppercase tracking-[0.15em] text-[9px] text-gray-400">Timestamp</TableHead>
                  <TableHead className="font-black uppercase tracking-[0.15em] text-[9px] text-gray-400">Status</TableHead>
                  <TableHead className="text-right py-5 px-8 font-black uppercase tracking-[0.15em] text-[9px] text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="border-none animate-pulse">
                      <TableCell colSpan={5} className="h-20 bg-gray-50/50" />
                    </TableRow>
                  ))
                ) : filteredAlerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-20 w-20 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center justify-center">
                          <ShieldAlert className="h-10 w-10 text-gray-200" />
                        </div>
                        <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No critical alerts active</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAlerts.map((alert, i) => (
                    <motion.tr
                      key={alert._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-none hover:bg-red-50/20 transition-colors group"
                    >
                      {/* Alert message */}
                      <TableCell className="py-5 px-8 max-w-sm">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${
                            alert.status === 'Sent'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-red-50 text-red-600 border border-red-100'
                          }`}>
                            <AlertCircle className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-800 line-clamp-2 leading-snug">{alert.message}</p>
                            <div className="flex items-center gap-1.5 mt-1 text-[9px] font-black text-gray-400 uppercase tracking-wider">
                              <Send className="h-2.5 w-2.5" />
                              {alert.type || "System Broadcast"}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Patient */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm">
                            {alert.patient_id?.name
                              ? alert.patient_id.name.charAt(0)
                              : <User className="h-4 w-4" />}
                          </div>
                          <p className="text-sm font-bold text-gray-800">{alert.patient_id?.name || "Global"}</p>
                        </div>
                      </TableCell>

                      {/* Timestamp */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-gray-700">
                            {new Date(alert.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                            {new Date(alert.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status badge */}
                      <TableCell>
                        <Badge className={`rounded-2xl border-none font-black text-[9px] uppercase tracking-widest px-3 py-1.5 inline-flex items-center gap-1 shadow-sm ${
                          alert.status === 'Sent'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {alert.status === 'Sent'
                            ? <CheckCircle2 className="h-3 w-3" />
                            : <Clock className="h-3 w-3" />}
                          {alert.status}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Update btn */}
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEdit(alert)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Update
                          </motion.button>

                          {/* Delete btn */}
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openDelete(alert)}
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

      {/* ── Edit / Update Modal ────────────────────────────────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="flex items-center gap-3 relative">
              <div className="p-2.5 bg-white/15 rounded-2xl border border-white/20">
                <Pencil className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-white tracking-tight">Update Alert</DialogTitle>
                <DialogDescription className="text-white/60 text-xs font-medium mt-0.5">
                  Edit the message or status of this alert
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6 bg-white">
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">Alert Message</Label>
              <textarea
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                rows={4}
                className="w-full rounded-2xl bg-gray-50 border border-gray-100 p-4 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-400/30 outline-none resize-none transition-all"
                placeholder="Enter alert message..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">Status</Label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm font-black text-gray-800 outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="Sent">Sent</option>
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
                className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200/60 transition-all active:scale-95"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Modal ───────────────────────────────────────────── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-red-500 to-red-700 p-8 relative">
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
            <div className="flex items-center gap-3 relative">
              <div className="p-2.5 bg-white/15 rounded-2xl border border-white/20">
                <Trash2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-white tracking-tight">Delete Alert</DialogTitle>
                <DialogDescription className="text-white/60 text-xs font-medium mt-0.5">
                  This action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 bg-white space-y-6">
            <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-sm font-bold text-gray-700 leading-relaxed line-clamp-3">
                "{deletingAlert?.message}"
              </p>
              <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-3">
                Patient: {deletingAlert?.patient_id?.name || "Global"}
              </p>
            </div>
            <p className="text-sm text-gray-500 font-medium text-center">
              Are you sure you want to permanently delete this alert?
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-gray-100 hover:bg-gray-50 transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200/60 transition-all active:scale-95"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
