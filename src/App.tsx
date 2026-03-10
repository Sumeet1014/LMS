import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import RequireAuth from "@/components/auth/RequireAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import FindMentor from "./pages/FindMentor";
import BecomeMentor from "./pages/BecomeMentorWorking";
import ViewSchedule from "./pages/ViewSchedule";
import ViewAchievements from "./pages/ViewAchievements";
import Challenges from "./pages/Challenges";
import Leaderboard from "./pages/Leaderboard";
import VideoRoom from "./pages/VideoRoom";
import CertificateViewer from "./pages/CertificateViewer";
import TestInput from "./pages/TestInput";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/find-mentor"
              element={
                <RequireAuth>
                  <FindMentor />
                </RequireAuth>
              }
            />
            <Route
              path="/become-mentor"
              element={
                <RequireAuth>
                  <BecomeMentor />
                </RequireAuth>
              }
            />
            <Route
              path="/schedule"
              element={
                <RequireAuth>
                  <ViewSchedule />
                </RequireAuth>
              }
            />
            <Route
              path="/achievements"
              element={
                <RequireAuth>
                  <ViewAchievements />
                </RequireAuth>
              }
            />
            <Route
              path="/challenges"
              element={
                <RequireAuth>
                  <Challenges />
                </RequireAuth>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <RequireAuth>
                  <Leaderboard />
                </RequireAuth>
              }
            />
            <Route
              path="/room/:roomId"
              element={
                <RequireAuth>
                  <VideoRoom />
                </RequireAuth>
              }
            />
            <Route path="/certificate/:shareToken" element={<CertificateViewer />} />
            <Route path="/test-input" element={<TestInput />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
