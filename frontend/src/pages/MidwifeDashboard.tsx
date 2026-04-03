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

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    mrn: "",
    age: "",
    gestationWeeks: "",
    phoneNumber: "",
    status: "normal",
    nextVisit: "",
  });

  const fetchPatients = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/patients", {
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
    fetchPatients();
  }, []);

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          age: Number(formData.age),
          gestationWeeks: Number(formData.gestationWeeks),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Patient registered successfully");
        setIsRegisterModalOpen(false);
        setFormData({
          name: "",
          mrn: "",
          age: "",
          gestationWeeks: "",
          phoneNumber: "",
          status: "normal",
          nextVisit: "",
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

  const schedule = [
    { name: "Li Wei", time: "02:30 PM", type: "Routine Checkup", active: true },
    { name: "Jane Doe", time: "04:00 PM", type: "Initial Consultation" },
    { name: "Sarah Jenkins", time: "Tomorrow, 10:00 AM", type: "Scan Review" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar variant="midwife" userName="Dr. Elena Ross" userRole="Senior Midwife" />

      <div className="flex-1 flex flex-col">
        <Header
          title="Midwife Dashboard"
          subtitle="Care management for St. Jude Maternal Ward • Oct 24, 2023"
          showRegisterPatient
          onRegisterPatient={() => setIsRegisterModalOpen(true)}
        />

        <main className="flex-1 p-8 overflow-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
            {/* Stats Grid */}
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
                value={patients.filter(p => p.status === 'high-risk').length}
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

            {/* Quick Actions */}
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
                <Button variant="outline" className="w-full justify-start gap-2 text-primary border-primary/20 hover:bg-primary/5">
                  <Upload className="h-4 w-4" />
                  Upload Lab Results
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 text-primary border-primary/20 hover:bg-primary/5">
                  <FileText className="h-4 w-4" />
                  Generate Referral Form
                </Button>
              </div>
            </div>
          </div>

          <div className="grid xl:grid-cols-3 gap-6">
            {/* Patient List */}
            <div className="xl:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Assigned Patients</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">All</Button>
                  <Button variant="secondary" size="sm" className="bg-warning/10 text-warning border-warning/20">
                    High Risk
                  </Button>
                  <Button variant="outline" size="sm">Emergency</Button>
                </div>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients by name, ID, or risk status..."
                  className="pl-10"
                />
              </div>

              <div className="space-y-3">
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <PatientCard
                      key={patient._id}
                      name={patient.name}
                      id={patient.mrn}
                      gestationWeeks={patient.gestationWeeks}
                      status={patient.status}
                      nextVisit={patient.nextVisit}
                      isHighlighted={patient.status === "emergency"}
                      onClick={() => navigate(`/midwife/patients/${patient._id}`)}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground font-medium">No patients registered yet</p>
                    <Button
                      variant="link"
                      className="text-primary mt-2"
                      onClick={() => setIsRegisterModalOpen(true)}
                    >
                      Register your first patient
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Schedule */}
              <div className="bg-card rounded-xl border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground uppercase text-xs tracking-wide">
                    Schedule
                  </h3>
                  <Link to="/midwife/calendar" className="text-xs text-primary hover:underline">
                    View Calendar
                  </Link>
                </div>

                <div className="space-y-4">
                  {schedule.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${item.active ? "bg-success" : "bg-muted-foreground/30"}`} />
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.time} • {item.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Alerts */}
              <div className="bg-card rounded-xl border p-5">
                <h3 className="font-semibold text-emergency uppercase text-xs tracking-wide mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Critical Alerts
                </h3>

                <div className="bg-emergency/5 border border-emergency/20 rounded-lg p-4">
                  <p className="font-medium text-foreground">High BP: Maria Gonzalez</p>
                  <p className="text-sm text-muted-foreground">
                    Auto-logged from home monitoring at 08:45 AM.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Register Patient Dialog */}
        <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Register New Patient</DialogTitle>
              <DialogDescription>
                Enter the patient's clinical and personal details to create a new record.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegisterPatient} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Patient name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mrn">MRN (Medical Record Number)</Label>
                  <Input
                    id="mrn"
                    placeholder="e.g. PC-2044"
                    value={formData.mrn}
                    onChange={(e) => setFormData({ ...formData, mrn: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weeks">Gestation Weeks</Label>
                  <Input
                    id="weeks"
                    type="number"
                    placeholder="e.g. 28"
                    value={formData.gestationWeeks}
                    onChange={(e) => setFormData({ ...formData, gestationWeeks: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+94 7X XXX XXXX"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Initial Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high-risk">High Risk</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visit">Next Visit</Label>
                  <Input
                    id="visit"
                    placeholder="e.g. Tomorrow, 10:00 AM"
                    value={formData.nextVisit}
                    onChange={(e) => setFormData({ ...formData, nextVisit: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsRegisterModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Registering..." : "Complete Registration"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
