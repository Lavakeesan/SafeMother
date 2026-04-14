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
import { Search, Users, Plus, Filter, AlertTriangle, Send, Upload, FileText, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function MidwifePatientsPage() {
    const navigate = useNavigate();
    const [patients, setPatients] = useState<any[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [emergencyTarget, setEmergencyTarget] = useState<any | null>(null);
    const [emergencyMessage, setEmergencyMessage] = useState("");
    const [isSendingAlert, setIsSendingAlert] = useState(false);
    const [uploadTarget, setUploadTarget] = useState<any | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mrn: "",
        age: "",
        gestationWeeks: "",
        phoneNumber: "",
        status: "normal",
        nextVisit: "",
    });

    const fetchPatients = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:5001/api/patients`, {
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

    const handleSendEmergency = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emergencyTarget) return;
        setIsSendingAlert(true);
        try {
            const response = await fetch(`http://${window.location.hostname}:5001/api/alerts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({
                    patient: emergencyTarget._id,
                    message: emergencyMessage,
                    alertDate: new Date().toISOString(),
                    status: 'Sent',
                }),
            });
            if (response.ok) {
                toast.success(`Emergency alert sent to ${emergencyTarget.name}`);
                setEmergencyTarget(null);
                setEmergencyMessage("");
            } else {
                const data = await response.json();
                toast.error(data.message || "Failed to send alert");
            }
        } catch (error) {
            toast.error("Could not send emergency alert.");
        } finally {
            setIsSendingAlert(false);
        }
    };

    const handleUploadReport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadTarget || !uploadFile) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('report', uploadFile);
            const response = await fetch(`http://${window.location.hostname}:5001/api/reports/upload/${uploadTarget._id}`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(`Report uploaded for ${uploadTarget.name}`);
                fetchPatients(); // Refresh list to show new report from DB
                setUploadTarget(null);
                setUploadFile(null);
            } else {
                toast.error(data.message || 'Upload failed');
            }
        } catch (err) {
            toast.error('Could not upload the report');
        } finally {
            setIsUploading(false);
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

    useEffect(() => {
        let result = patients;

        if (searchTerm) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.mrn.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterStatus !== "all") {
            result = result.filter(p => p.risk_level === filterStatus);
        }

        setFilteredPatients(result);
    }, [searchTerm, filterStatus, patients]);

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
                    gestationWeeks: Number(formData.gestationWeeks),
                }),
            });

            if (response.ok) {
                toast.success("Patient registered successfully");
                setIsRegisterModalOpen(false);
                setFormData({
                    name: "",
                    email: "",
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
            <Sidebar 
                variant="midwife" 
                userName={user?.name || "Midwife User"} 
                userRole={user?.role === 'midwife' ? 'Senior Midwife' : 'Clinical Administrator'} 
            />

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
                                    <SelectValue placeholder="Filter by Risk Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Patients</SelectItem>
                                    <SelectItem value="Low">Low Risk</SelectItem>
                                    <SelectItem value="Medium">Medium Risk</SelectItem>
                                    <SelectItem value="High">High Risk</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                Total Patients ({filteredPatients.length})
                            </h2>
                        </div>

                        <div className="grid gap-3">
                            {filteredPatients.length > 0 ? (
                                filteredPatients.map((patient) => (
                                    <div key={patient._id}>
                                        {/* Patient Summary Row */}
                                        <div
                                            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                                                selectedPatient?._id === patient._id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'bg-background hover:border-primary/50'
                                            }`}
                                            onClick={() =>
                                                setSelectedPatient(
                                                    selectedPatient?._id === patient._id ? null : patient
                                                )
                                            }
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                                    {patient.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">{patient.name}</p>
                                                    <p className="text-sm text-muted-foreground">MRN: {patient.mrn} • Age: {patient.age}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                                    patient.risk_level === 'High'
                                                        ? 'bg-red-100 text-red-700'
                                                        : patient.risk_level === 'Medium'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {patient.risk_level} Risk
                                                </span>
                                                {/* Emergency Button */}
                                                <button
                                                    type="button"
                                                    title="Send Emergency Alert"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEmergencyTarget(patient);
                                                        setEmergencyMessage(`⚠️ Emergency notice for ${patient.name}: Please contact the clinic immediately.`);
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all shadow-sm"
                                                >
                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                    Alert
                                                </button>

                                                {/* Upload Button */}
                                                <button
                                                    type="button"
                                                    title="Upload Medical Report"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setUploadTarget(patient);
                                                        setUploadFile(null);
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
                                                >
                                                    <Upload className="h-3.5 w-3.5" />
                                                    Upload Medical Reports
                                                </button>

                                                <span className="text-muted-foreground text-sm">
                                                    {selectedPatient?._id === patient._id ? '▲' : '▼'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Expanded Details Panel */}
                                        {selectedPatient?._id === patient._id && (
                                            <div className="mt-1 mb-2 p-5 rounded-xl border border-primary/20 bg-primary/5 text-sm">
                                                <h3 className="font-semibold text-foreground mb-4 text-base border-b pb-2">Patient Details</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    <div>
                                                        <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Full Name</p>
                                                        <p className="font-medium text-foreground">{patient.name || '—'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">MRN</p>
                                                        <p className="font-medium text-foreground">{patient.mrn || '—'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Age</p>
                                                        <p className="font-medium text-foreground">{patient.age || '—'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Contact Number</p>
                                                        <p className="font-medium text-foreground">{patient.contact_number || '—'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Address</p>
                                                        <p className="font-medium text-foreground">{patient.address || '—'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Risk Level</p>
                                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                                            patient.risk_level === 'High' ? 'bg-red-100 text-red-700'
                                                            : patient.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-green-100 text-green-700'
                                                        }`}>
                                                            {patient.risk_level}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Expected Delivery Date</p>
                                                        <p className="font-medium text-foreground">
                                                            {patient.delivery_date
                                                                ? new Date(patient.delivery_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
                                                                : '—'}
                                                        </p>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Medical History</p>
                                                        <p className="font-medium text-foreground">{patient.medical_history || '—'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Registered On</p>
                                                        <p className="font-medium text-foreground">
                                                            {patient.createdAt
                                                                ? new Date(patient.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
                                                                : '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {/* Medical Reports Section */}
                                                <div className="border-t pt-4 mt-2">
                                                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                                                        <FileText className="h-3 w-3" />
                                                        Medical Reports ({patient.medical_reports?.length || 0})
                                                    </p>
                                                    {patient.medical_reports && patient.medical_reports.length > 0 ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                            {patient.medical_reports.map((report: any, index: number) => (
                                                                <a 
                                                                    key={index}
                                                                    href={`http://${window.location.hostname}:5001/api/reports/view/${patient._id}/${report._id}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 p-2 rounded-lg border bg-background hover:bg-muted/50 transition-colors group"
                                                                >
                                                                    <div className="p-1.5 rounded bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                                        <FileText className="h-4 w-4" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-medium truncate">{report.original_name}</p>
                                                                        <p className="text-[10px] text-muted-foreground">
                                                                            {new Date(report.uploaded_at).toLocaleDateString()}
                                                                        </p>
                                                                    </div>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground italic">No reports uploaded yet</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
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
                            <div className="space-y-2">
                                <Label htmlFor="p-email">Email Address</Label>
                                <Input
                                    id="p-email"
                                    type="email"
                                    placeholder="patient@gmail.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
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

                {/* Emergency Alert Dialog */}
                <Dialog open={!!emergencyTarget} onOpenChange={(open) => { if (!open) { setEmergencyTarget(null); setEmergencyMessage(""); } }}>
                    <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden">
                        {/* Red header */}
                        <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-5">
                            <DialogTitle className="text-white text-lg font-bold flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Send Emergency Alert
                            </DialogTitle>
                            <DialogDescription className="text-red-100 text-sm mt-1">
                                This alert will be recorded for <span className="font-semibold">{emergencyTarget?.name}</span> with MRN {emergencyTarget?.mrn}.
                            </DialogDescription>
                        </div>

                        <form onSubmit={handleSendEmergency} className="px-6 py-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Patient</label>
                                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
                                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                                        {emergencyTarget?.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground text-sm">{emergencyTarget?.name}</p>
                                        <p className="text-xs text-muted-foreground">MRN: {emergencyTarget?.mrn} · {emergencyTarget?.contact_number}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground" htmlFor="alert-msg">
                                    Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="alert-msg"
                                    rows={4}
                                    required
                                    placeholder="Type your emergency message..."
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                    value={emergencyMessage}
                                    onChange={(e) => setEmergencyMessage(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => { setEmergencyTarget(null); setEmergencyMessage(""); }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSendingAlert}
                                    className="bg-red-600 hover:bg-red-700 text-white gap-2"
                                >
                                    {isSendingAlert ? (
                                        <>
                                            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Send Alert
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Upload Medical Report Dialog */}
                <Dialog open={!!uploadTarget} onOpenChange={(open) => { if (!open) { setUploadTarget(null); setUploadFile(null); } }}>
                    <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden">
                        <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5">
                            <DialogTitle className="text-white text-lg font-bold flex items-center gap-2">
                                <Upload className="h-5 w-5" />
                                Upload Medical Report
                            </DialogTitle>
                            <DialogDescription className="text-primary-foreground/70 text-sm mt-1">
                                Upload a report for <span className="font-semibold">{uploadTarget?.name}</span> (MRN: {uploadTarget?.mrn})
                            </DialogDescription>
                        </div>

                        <form onSubmit={handleUploadReport} className="px-6 py-5 space-y-4">
                            {/* Drop zone */}
                            <div
                                className="border-2 border-dashed border-primary/30 rounded-xl p-6 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
                                onClick={() => document.getElementById('report-file-input')?.click()}
                            >
                                {uploadFile ? (
                                    <div className="flex items-center justify-between bg-muted/40 rounded-lg p-3">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-8 w-8 text-primary" />
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-foreground truncate max-w-[220px]">{uploadFile.name}</p>
                                                <p className="text-xs text-muted-foreground">{(uploadFile.size / 1024).toFixed(1)} KB · {uploadFile.type}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setUploadFile(null); }}
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-foreground">Click to browse or drag & drop</p>
                                        <p className="text-xs text-muted-foreground mt-1">Supports: JPG, PNG, GIF, WEBP, BMP, TIFF, PDF · Max 20MB</p>
                                    </>
                                )}
                            </div>

                            <input
                                id="report-file-input"
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                            />

                            <div className="flex justify-end gap-3 pt-2 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => { setUploadTarget(null); setUploadFile(null); }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!uploadFile || isUploading}
                                    className="gap-2"
                                >
                                    {isUploading ? (
                                        <>
                                            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4" />
                                            Upload Medical Reports
                                        </>
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
