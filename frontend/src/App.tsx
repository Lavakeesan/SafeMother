import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MidwifeDashboard from "./pages/MidwifeDashboard";
import PatientProfilePage from "./pages/PatientProfilePage";
import PatientDashboard from "./pages/PatientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EmergencyPage from "./pages/EmergencyPage";
import ResourceLibrary from "./pages/ResourceLibrary";
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
          <Route path="/midwife/patients" element={<MidwifeDashboard />} />
          <Route path="/midwife/patients/:id" element={<PatientProfilePage />} />
          <Route path="/midwife/calendar" element={<MidwifeDashboard />} />
          <Route path="/midwife/reports" element={<MidwifeDashboard />} />
          <Route path="/midwife/settings" element={<MidwifeDashboard />} />
          <Route path="/midwife/resources" element={<ResourceLibrary />} />
          
          {/* Patient Routes */}
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/patient/care-plan" element={<PatientDashboard />} />
          <Route path="/patient/advice" element={<PatientDashboard />} />
          <Route path="/patient/resources" element={<ResourceLibrary />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/system" element={<AdminDashboard />} />
          <Route path="/admin/guidelines" element={<ResourceLibrary />} />
          <Route path="/admin/audit" element={<AdminDashboard />} />
          <Route path="/admin/config" element={<AdminDashboard />} />
          
          {/* Emergency */}
          <Route path="/emergency" element={<EmergencyPage />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
