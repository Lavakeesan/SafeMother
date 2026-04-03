import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { PatientCard } from "@/components/PatientCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Search, Users, Plus, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function MidwifePatientsPage() {
    const navigate = useNavigate();
    const [patients, setPatients] = useState<any[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
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
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setPatients(data);
                setFilteredPatients(data);
            }
        } catch (error) {
            console.error("Failed to fetch patients:", error);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        let result = patients;

        if (searchTerm) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.mrn.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterStatus !== "all") {
            result = result.filter(p => p.status === filterStatus);
        }

        setFilteredPatients(result);
    }, [searchTerm, filterStatus, patients]);

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
                fetchPatients();
            } else {
                const data = await response.json();
                toast.error(data.message || "Failed to register patient");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar variant="midwife" userName="Dr. Elena Ross" userRole="Senior Midwife" />

            <div className="flex-1 flex flex-col">
                <Header
                    title="Patient Directory"
                    subtitle="Manage all assigned patients and their health records"
                    showRegisterPatient
                    onRegisterPatient={() => setIsRegisterModalOpen(true)}
                />

                <main className="flex-1 p-8 overflow-auto">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or MRN..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Filter by Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Patients</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="high-risk">High Risk</SelectItem>
                                    <SelectItem value="emergency">Emergency</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={() => setIsRegisterModalOpen(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Register New
                            </Button>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                Total Patients ({filteredPatients.length})
                            </h2>
                        </div>

                        <div className="grid gap-4">
                            {filteredPatients.length > 0 ? (
                                filteredPatients.map((patient) => (
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
                                <div className="text-center py-20 border-2 border-dashed rounded-xl">
                                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                    <p className="text-muted-foreground font-medium">No patients found</p>
                                    <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

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
                                    <Label htmlFor="p-name">Full Name</Label>
                                    <Input
                                        id="p-name"
                                        placeholder="Patient name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="p-mrn">MRN</Label>
                                    <Input
                                        id="p-mrn"
                                        placeholder="e.g. PC-2044"
                                        value={formData.mrn}
                                        onChange={(e) => setFormData({ ...formData, mrn: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="p-age">Age</Label>
                                    <Input
                                        id="p-age"
                                        type="number"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="p-weeks">Gestation Weeks</Label>
                                    <Input
                                        id="p-weeks"
                                        type="number"
                                        value={formData.gestationWeeks}
                                        onChange={(e) => setFormData({ ...formData, gestationWeeks: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="p-phone">Phone Number</Label>
                                <Input
                                    id="p-phone"
                                    placeholder="+94 7X XXX XXXX"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="p-status">Initial Status</Label>
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
                                    <Label htmlFor="p-visit">Next Visit</Label>
                                    <Input
                                        id="p-visit"
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
