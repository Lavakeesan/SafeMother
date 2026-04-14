import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { PatientCard } from "@/components/PatientCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Users, Baby, AlertTriangle, Zap, Search, Calendar, Edit, Upload, FileText, ChevronRight, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function MidwifeDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form State - Using snake_case to match DB
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mrn: "",
    age: "",
    address: "",
    contact_number: "",
    medical_history: "",
    delivery_date: "",
    risk_level: "Low",
    user_id: "", 
  });

  const fetchPatients = async () => {
    try {
      const response = await fetch(`http://${window.location.hostname}:5001/api/patients`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    }
  };

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    } else {
      navigate("/login");
    }
    fetchPatients();
  }, []);

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`http://${window.location.hostname}:5001/api/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          age: Number(formData.age),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Patient registered successfully");
        setIsRegisterModalOpen(false);
        setFormData({
          name: "",
          email: "",
          mrn: "",
          age: "",
          address: "",
          contact_number: "",
          medical_history: "",
          delivery_date: "",
          risk_level: "Low",
          user_id: "",
        });
        fetchPatients(); // Refresh list
      } else {
        toast.error(data.message || "Failed to register patient");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        variant="midwife" 
        userName={user?.name || "Midwife User"} 
        userRole={user?.role === 'midwife' ? 'Senior Midwife' : 'Clinical Administrator'} 
      />

      <div className="flex-1 flex flex-col">
        <Header
          title="Midwife Dashboard"
          subtitle="Care management for maternal health"
          showRegisterPatient
          onRegisterPatient={() => setIsRegisterModalOpen(true)}
        />

        <main className="flex-1 p-8 overflow-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
            <div className="xl:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Active Patients"
                value={patients.length}
                trend={{ value: "+4% vs last month", positive: true }}
                icon={Users}
              />
              <StatCard
                title="Due Today"
                value={3}
                subtitle="Estimated delivery"
                icon={Baby}
              />
              <StatCard
                title="High Risk"
                value={patients.filter(p => p.risk_level === 'High').length}
                trend={{ value: "+2 since yesterday", positive: false }}
                icon={AlertTriangle}
                iconColor="text-warning"
              />
              <StatCard
                title="Alerts"
                value={2}
                subtitle="Requires Attention"
                icon={Zap}
                iconColor="text-emergency"
              />
            </div>
            <div className="bg-card rounded-xl border p-5">
              <h3 className="font-semibold text-foreground mb-4 uppercase text-xs tracking-wide">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-primary border-primary/20 hover:bg-primary/5"
                  onClick={() => setIsRegisterModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Register New Patient
                </Button>
              </div>
            </div>
          </div>

          <div className="grid xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <h2 className="text-lg font-semibold text-foreground mb-4">Assigned Patients</h2>
              <div className="space-y-3">
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <PatientCard
                      key={patient._id}
                      name={patient.name}
                      id={patient.mrn}
                      gestationWeeks={0}
                      status={patient.risk_level === 'High' ? 'high-risk' : (patient.risk_level === 'Medium' ? 'pending' : 'normal')}
                      nextVisit={patient.contact_number}
                      isHighlighted={patient.risk_level === 'High'}
                      onClick={() => navigate(`/midwife/patients/${patient._id}`)}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed text-muted-foreground">
                    No patients registered
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 text-primary-foreground">
              <DialogTitle className="text-xl font-bold text-white">Register New Patient</DialogTitle>
              <DialogDescription className="text-primary-foreground/70 text-sm mt-1">
                Fill in the patient's personal and clinical information below.
              </DialogDescription>
            </div>

            <form onSubmit={handleRegisterPatient} className="px-6 py-5 space-y-5">

              {/* Section: Personal Info */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <span className="inline-block w-4 h-px bg-muted-foreground/40"></span>
                  Personal Information
                  <span className="inline-block flex-1 h-px bg-muted-foreground/20"></span>
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      placeholder="e.g. Amara Silva"
                      className="h-10"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mrn" className="text-sm font-medium">MRN <span className="text-red-500">*</span></Label>
                    <Input
                      id="mrn"
                      placeholder="e.g. MRN-1042"
                      className="h-10"
                      value={formData.mrn}
                      onChange={(e) => setFormData({ ...formData, mrn: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g. patient@gmail.com"
                      className="h-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="age" className="text-sm font-medium">Age <span className="text-red-500">*</span></Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="e.g. 26"
                      className="h-10"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-medium">Contact Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="phone"
                      placeholder="+94 7X XXX XXXX"
                      className="h-10"
                      value={formData.contact_number}
                      onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label htmlFor="address" className="text-sm font-medium">Address <span className="text-red-500">*</span></Label>
                    <Input
                      id="address"
                      placeholder="Street, City, District"
                      className="h-10"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section: Clinical Info */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <span className="inline-block w-4 h-px bg-muted-foreground/40"></span>
                  Clinical Information
                  <span className="inline-block flex-1 h-px bg-muted-foreground/20"></span>
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <Label htmlFor="medical_history" className="text-sm font-medium">Medical History</Label>
                    <textarea
                      id="medical_history"
                      placeholder="Previous conditions, surgeries, allergies..."
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      value={formData.medical_history}
                      onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="delivery_date" className="text-sm font-medium">Expected Delivery Date</Label>
                    <Input
                      id="delivery_date"
                      type="date"
                      className="h-10"
                      value={formData.delivery_date}
                      onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="riskLevel" className="text-sm font-medium">Risk Level <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.risk_level}
                      onValueChange={(value) => setFormData({ ...formData, risk_level: value })}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Low Risk
                          </span>
                        </SelectItem>
                        <SelectItem value="Medium">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span> Medium Risk
                          </span>
                        </SelectItem>
                        <SelectItem value="High">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> High Risk
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="px-6"
                  onClick={() => setIsRegisterModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="px-6 gap-2">
                  {isLoading ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"></span>
                      Registering...
                    </>
                  ) : (
                    "Register Patient"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
