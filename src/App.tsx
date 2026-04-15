import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import RequireAuth from "@/components/auth/RequireAuth";
import RequireRole from "@/components/auth/RequireRole";
import Index from "./pages/Index";
import LoginSelect from "./pages/LoginSelect";
import StudentLogin from "./pages/StudentLogin";
import MentorLogin from "./pages/MentorLogin";
import Login from "./pages/Login";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import MentorDashboardPage from "./pages/MentorDashboardPage";
import Dashboard from "./pages/Dashboard";
import FindMentor from "./pages/FindMentor";
import BecomeMentor from "./pages/BecomeMentorWorking";
import ManageMentorProfiles from "./pages/ManageMentorProfiles";
import MentorAssignments from "./pages/MentorAssignments";
import MentorCourses from "./pages/MentorCourses";
import StudentCourses from "./pages/StudentCourses";
import SubmitAssignment from "./pages/SubmitAssignment";
import ViewSchedule from "./pages/ViewSchedule";
import ViewAchievements from "./pages/ViewAchievements";
import Challenges from "./pages/Challenges";
import Leaderboard from "./pages/Leaderboard";
import VideoRoom from "./pages/VideoRoom";
import CertificateViewer from "./pages/CertificateViewer";
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
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginSelect />} />
            <Route path="/login/student" element={<StudentLogin />} />
            <Route path="/login/mentor" element={<MentorLogin />} />
            <Route path="/login/legacy" element={<Login />} />
            <Route path="/certificate/:shareToken" element={<CertificateViewer />} />
            <Route path="/room/:roomId" element={<VideoRoom />} />

            {/* Student-only routes */}
            <Route path="/student/dashboard" element={<RequireRole role="student"><StudentDashboardPage /></RequireRole>} />
            <Route path="/my-courses" element={<RequireRole role="student"><StudentCourses /></RequireRole>} />
            <Route path="/submit-assignment/:id" element={<RequireRole role="student"><SubmitAssignment /></RequireRole>} />
            <Route path="/find-mentor" element={<RequireRole role="student"><FindMentor /></RequireRole>} />

            {/* Mentor-only routes */}
            <Route path="/mentor/dashboard" element={<RequireRole role="mentor"><MentorDashboardPage /></RequireRole>} />
            <Route path="/mentor-profiles" element={<RequireRole role="mentor"><ManageMentorProfiles /></RequireRole>} />
            <Route path="/mentor-assignments" element={<RequireRole role="mentor"><MentorAssignments /></RequireRole>} />
            <Route path="/mentor-courses" element={<RequireRole role="mentor"><MentorCourses /></RequireRole>} />
            <Route path="/become-mentor" element={<RequireAuth><BecomeMentor /></RequireAuth>} />

            {/* Shared routes (both roles) */}
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/schedule" element={<RequireAuth><ViewSchedule /></RequireAuth>} />
            <Route path="/achievements" element={<RequireAuth><ViewAchievements /></RequireAuth>} />
            <Route path="/challenges" element={<RequireAuth><Challenges /></RequireAuth>} />
            <Route path="/leaderboard" element={<RequireAuth><Leaderboard /></RequireAuth>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

