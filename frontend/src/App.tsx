import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MidwifeDashboard from "./pages/MidwifeDashboard";
import MidwifePatientsPage from "./pages/MidwifePatientsPage";
import PatientProfilePage from "./pages/PatientProfilePage";
import PatientDashboard from "./pages/PatientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminMidwivesPage from "./pages/AdminMidwivesPage";
import AdminPatientsPage from "./pages/AdminPatientsPage";
import AdminAppointmentsPage from "./pages/AdminAppointmentsPage";
import AdminAlertsPage from "./pages/AdminAlertsPage";
import AdminGuidelinesPage from "./pages/AdminGuidelinesPage";
import ResourceLibrary from "./pages/ResourceLibrary";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorPatientsPage from "./pages/DoctorPatientsPage";
import DoctorConsultationsPage from "./pages/DoctorConsultationsPage";
import DoctorChatPage from "./pages/DoctorChatPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />

          {/* Midwife Routes */}
          <Route path="/midwife" element={<MidwifeDashboard />} />
          <Route path="/midwife/patients" element={<MidwifePatientsPage />} />
          <Route path="/midwife/patients/:id" element={<PatientProfilePage />} />
          <Route path="/midwife/calendar" element={<MidwifeDashboard />} />
          <Route path="/midwife/reports" element={<MidwifeDashboard />} />
          <Route path="/midwife/settings" element={<MidwifeDashboard />} />
          <Route path="/midwife/resources" element={<ResourceLibrary />} />

          {/* Patient Routes */}
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/patient/care-plan" element={<PatientDashboard />} />
          <Route path="/patient/advice" element={<PatientDashboard />} />
          <Route path="/patient/alert" element={<PatientDashboard />} />
          <Route path="/patient/reports" element={<PatientDashboard />} />
          <Route path="/patient/resources" element={<ResourceLibrary />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/midwives" element={<AdminMidwivesPage />} />
          <Route path="/admin/patients" element={<AdminPatientsPage />} />
          <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
          <Route path="/admin/alerts" element={<AdminAlertsPage />} />
          <Route path="/admin/guidelines" element={<AdminGuidelinesPage />} />
          <Route path="/admin/audit" element={<AdminDashboard />} />
          <Route path="/admin/config" element={<AdminDashboard />} />

          {/* Doctor Routes */}
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/patients" element={<DoctorPatientsPage />} />
          <Route path="/doctor/consultations" element={<DoctorConsultationsPage />} />
          <Route path="/doctor/chat" element={<DoctorChatPage />} />



          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
