import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { 
  Users, Search, Filter, MoreVertical, 
  MapPin, Calendar, Activity, ShieldAlert,
  Edit2, Trash2, UserPlus, HeartPulse,
  Cake, Home, Phone as PhoneIcon, History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";


export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  // Edit/Delete States
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    mrn: "",
    risk_level: "Low",
    age: "",
    address: "",
    contact_number: "",
    medical_history: "",
    delivery_date: ""
  });

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/patients`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (err) {
      toast.error("Failed to load patients");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleEdit = (patient: any) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name,
      mrn: patient.mrn || "",
      risk_level: patient.risk_level || "Low",
      age: patient.age?.toString() || "",
      address: patient.address || "",
      contact_number: patient.contact_number || "",
      medical_history: patient.medical_history || "",
      delivery_date: patient.delivery_date ? new Date(patient.delivery_date).toISOString().split('T')[0] : ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients/${selectedPatient._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("Patient clinical record updated");
        setIsEditDialogOpen(false);
        fetchPatients();
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients/${selectedPatient._id}`, {
        method: "DELETE",
        credentials: 'include'
      });

      if (response.ok) {
        toast.success("Patient case permanently removed");
        setIsDeleteDialogOpen(false);
        fetchPatients();
      } else {
        toast.error("Delete failed");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.mrn?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === "all" || p.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar variant="admin" />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header title="Maternal Case Directory" subtitle="Monitoring patient risk levels and midwife assignments" />

        <main className="flex-1 overflow-auto p-8 bg-muted/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex flex-1 items-center gap-4 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search MRN or patient name..." 
                  className="pl-10 h-12 rounded-2xl bg-card border-none shadow-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-2xl shadow-sm border border-muted">
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                <select 
                  className="bg-transparent text-sm font-bold outline-none"
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                >
                  <option value="all">All Risks</option>
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>
            </div>

            <Button className="h-12 px-6 rounded-2xl font-bold gap-2">
              <UserPlus className="h-5 w-5" />
              Direct Intake
            </Button>
          </div>

          <div className="bg-card rounded-3xl border-none shadow-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-none">
                  <TableHead className="py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Patient MRN & Identity</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Risk Level</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Assigned Midwife</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Expected Delivery</TableHead>
                  <TableHead className="text-right py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Control</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell colSpan={5} className="h-16 bg-muted/10 border-none" />
                    </TableRow>
                  ))
                ) : filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-muted-foreground italic">
                      No patient records found in the registry
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient._id} className="group hover:bg-muted/10 border-muted/20 transition-colors">
                      <TableCell className="py-4 px-8">
                        <div className="flex items-center gap-3">
                           <div className="bg-primary/5 p-2 rounded-xl">
                              <HeartPulse className="h-5 w-5 text-primary" />
                           </div>
                           <div>
                              <p className="font-black text-sm text-foreground">{patient.name}</p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">MRN: {patient.mrn || "N/A"}</p>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`rounded-xl border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 ${
                          patient.risk_level === 'High' ? 'bg-emergency/10 text-emergency' :
                          patient.risk_level === 'Medium' ? 'bg-amber-100 text-amber-600' :
                          'bg-success/10 text-success'
                        }`}>
                          {patient.risk_level || 'Pending Evaluation'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase">
                              {patient.midwife_id?.name ? patient.midwife_id.name.charAt(0) : '?'}
                           </div>
                           <div>
                              <p className="text-xs font-bold text-foreground leading-none">{patient.midwife_id?.name || "Unassigned"}</p>
                              <p className="text-[10px] font-medium text-muted-foreground mt-1">{patient.midwife_id?.hospital_name || ""}</p>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                           <Calendar className="h-3.5 w-3.5" />
                           {patient.delivery_date ? new Date(patient.delivery_date).toLocaleDateString() : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="px-8 flex items-center justify-end gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleEdit(patient)}
                          className="h-9 px-4 rounded-xl font-bold text-xs gap-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all border-none shadow-none"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => { setSelectedPatient(patient); setIsDeleteDialogOpen(true); }}
                          className="h-9 px-4 rounded-xl font-bold text-xs gap-1.5 bg-emergency/10 text-emergency hover:bg-emergency hover:text-white transition-all border-none shadow-none"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl rounded-[2.5rem] p-10 border-none shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-black tracking-tight">Modify Clinical Profile</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Users className="h-3 w-3" /> Full Name
              </Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="h-12 rounded-2xl bg-muted/50 border-none px-4 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <ShieldAlert className="h-3 w-3" /> Medical Record Number (MRN)
              </Label>
              <Input 
                value={formData.mrn}
                onChange={(e) => setFormData({...formData, mrn: e.target.value})}
                className="h-12 rounded-2xl bg-muted/50 border-none px-4 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                 <Cake className="h-3 w-3" /> Age
              </Label>
              <Input 
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="h-12 rounded-2xl bg-muted/50 border-none px-4 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                 <Activity className="h-3 w-3" /> Clinical Risk Level
              </Label>
              <select 
                value={formData.risk_level}
                onChange={(e) => setFormData({...formData, risk_level: e.target.value})}
                className="w-full h-12 rounded-2xl bg-muted/50 border-none px-4 font-bold outline-none"
              >
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                 <Home className="h-3 w-3" /> Residential Address
              </Label>
              <Input 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="h-12 rounded-2xl bg-muted/50 border-none px-4 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                 <PhoneIcon className="h-3 w-3" /> Contact Number
              </Label>
              <Input 
                value={formData.contact_number}
                onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                className="h-12 rounded-2xl bg-muted/50 border-none px-4 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                 <Calendar className="h-3 w-3" /> Expected Delivery Date
              </Label>
              <Input 
                type="date"
                value={formData.delivery_date}
                onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
                className="h-12 rounded-2xl bg-muted/50 border-none px-4 font-bold"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                 <History className="h-3 w-3" /> Medical History Summary
              </Label>
              <Textarea 
                value={formData.medical_history}
                onChange={(e) => setFormData({...formData, medical_history: e.target.value})}
                className="min-h-[100px] rounded-2xl bg-muted/50 border-none p-4 font-medium resize-none"
              />
            </div>
          </div>
          <DialogFooter className="mt-10 gap-3">
            <Button 
                variant="ghost" 
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest"
            >
              Cancel
            </Button>
            <Button 
                onClick={handleUpdate} 
                disabled={isUpdating}
                className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest bg-primary text-white shadow-xl shadow-primary/20"
            >
              {isUpdating ? "Processing..." : "Commit Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2.5rem] p-10 border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-black tracking-tight text-emergency">Archive Patient Case?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium pt-4 text-base">
              You are about to permanently remove the medical record for <span className="font-black text-foreground underline decoration-emergency/30 underline-offset-4">{selectedPatient?.name}</span> (MRN: {selectedPatient?.mrn}). This action will purge all diagnostic data and cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-4">
            <AlertDialogCancel className="h-14 flex-1 rounded-2xl font-black uppercase tracking-widest border-none bg-muted hover:bg-muted/80">Retain Case</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleDelete}
                className="h-14 flex-1 rounded-2xl font-black uppercase tracking-widest bg-emergency text-white hover:bg-emergency/90 shadow-xl shadow-emergency/20"
            >
                Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
