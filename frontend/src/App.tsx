import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DataJobs from "./pages/DataJobs";
import CreateJob from "./pages/CreateJob";
import JobDetails from "./pages/JobDetails";
import Enrichment from "./pages/Enrichment";
import DataEnrichment from "./pages/DataEnrichment";
import WorkflowAutomation from "./pages/WorkflowAutomation";
import IntegrationHub from "./pages/IntegrationHub";
import Integrations from "./pages/Integrations";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import SalesforceConfig from "./pages/SalesforceConfig";
import HubspotConfig from "./pages/HubspotConfig";
import GoogleSheetsConfig from "./pages/GoogleSheetsConfig";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <Dashboard />
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/data-jobs" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <DataJobs />
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/data-jobs/:id" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <JobDetails />
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/create-job" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <CreateJob />
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/enrichment" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <Enrichment />
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/data-enrichment" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <DataEnrichment />
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/workflow-automation" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <WorkflowAutomation />
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/integration-hub" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <IntegrationHub />
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/integrations" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <Integrations />
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <Reports />
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <Settings />
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/salesforce-config" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <SalesforceConfig />
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/hubspot-config" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <HubspotConfig />
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/sheets-config" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <GoogleSheetsConfig />
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
