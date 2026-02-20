import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import { Loader2 } from "lucide-react";
import { Toaster } from "./components/ui/sonner";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { StudentSignupPage } from "./pages/auth/StudentSignupPage";
import { AdminSignupPage } from "./pages/auth/AdminSignupPage";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { CreateEventPage } from "./pages/admin/CreateEventPage";
import { ManageEventsPage } from "./pages/admin/ManageEventsPage";
import { EventAnalyticsPage } from "./pages/admin/EventAnalyticsPage";
import { EventDetailsPage } from "./pages/shared/EventDetailsPage";
import { CompanyVisitsPage } from "./pages/shared/CompanyVisitsPage";
import { CompanyVisitDetailsPage } from "./pages/shared/CompanyVisitDetailsPage";
import { BrowseEventsPage } from "./pages/student/BrowseEventsPage";
import { MyRegisteredEventsPage } from "./pages/student/MyRegisteredEventsPage";
import { CreateCompanyVisitPage } from "./pages/admin/CreateCompanyVisitPage";
import { CompanyVisitAnalyticsPage } from "./pages/admin/CompanyVisitAnalyticsPage";
import { ProfilePage } from "./pages/shared/ProfilePage";
import { CalendarPage } from "./pages/shared/CalendarPage";
import { EditCompanyVisitPage } from "./pages/admin/EditCompanyVisitPage";

// Placeholders for remaining less critical pages for prototype
const UpdatePasswordPage = () => <div className="p-4">Update Password (Coming Soon)</div>;

function PublicLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      <Outlet />
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}

function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: 'student' | 'admin' }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<LandingPage />} />

            {/* Auth */}
            <Route path="login" element={<LoginPage />} />
            <Route path="signup/student" element={<StudentSignupPage />} />
            <Route path="signup/admin" element={<AdminSignupPage />} />

            {/* Public Company Visit Details (protected apply button inside) */}
            <Route path="company/:id" element={<CompanyVisitDetailsPage />} />
          </Route>

          <Route element={<AppLayout />}>
            {/* Student Routes */}
            <Route path="student" element={<ProtectedRoute role="student"><Outlet /></ProtectedRoute>}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="events" element={<BrowseEventsPage />} />
              <Route path="events/:id" element={<EventDetailsPage />} />
              <Route path="registrations" element={<MyRegisteredEventsPage />} />
              <Route path="placements" element={<CompanyVisitsPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="admin" element={<ProtectedRoute role="admin"><Outlet /></ProtectedRoute>}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="events" element={<ManageEventsPage />} />
              <Route path="events/create" element={<CreateEventPage />} />
              <Route path="events/analytics" element={<EventAnalyticsPage />} />
              <Route path="placements" element={<CompanyVisitsPage />} />
              <Route path="placements/create" element={<CreateCompanyVisitPage />} />
              <Route path="placements/:id/edit" element={<EditCompanyVisitPage />} />
              <Route path="placements/analytics" element={<CompanyVisitAnalyticsPage />} />
            </Route>

            {/* Shared Protected */}
            <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="update-password" element={<ProtectedRoute><UpdatePasswordPage /></ProtectedRoute>} />
            <Route path="calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}
