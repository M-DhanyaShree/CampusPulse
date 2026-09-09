import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { SubmitComplaintPage } from './pages/student/SubmitComplaintPage';
import { MyComplaintsPage } from './pages/student/MyComplaintsPage';
import { ComplaintDetailsPage } from './pages/student/ComplaintDetailsPage';
import { SurveysPage } from './pages/student/SurveysPage';
import { NotificationsPage } from './pages/student/NotificationsPage';
import { ProfilePage } from './pages/student/ProfilePage';

// Dept Admin Pages
import { DeptQueuePage } from './pages/dept/DeptQueuePage';
import { KanbanBoardPage } from './pages/dept/KanbanBoardPage';
import { DeptReportsPage } from './pages/dept/DeptReportsPage';

// Management Pages
import { ManagementAnalyticsPage } from './pages/management/ManagementAnalyticsPage';
import { ManagementSurveysPage } from './pages/management/ManagementSurveysPage';
import { AIReportsPage } from './pages/management/AIReportsPage';
import { CampusHeatmapsPage } from './pages/management/CampusHeatmapsPage';

// Super Admin Pages
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { SystemSettingsPage } from './pages/admin/SystemSettingsPage';

export const App: React.FC = () => {
  const { role, isAuthenticated } = useAuth();

  const getDefaultRedirect = () => {
    if (!isAuthenticated) return '/login';
    if (role === 'dept_admin') return '/dept/queue';
    if (role === 'management') return '/management/analytics';
    if (role === 'superadmin') return '/admin/users';
    return '/student/dashboard';
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Main Authenticated Layout */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to={getDefaultRedirect()} replace />} />

        {/* Universal Complaints details accessible to all roles */}
        <Route path="/complaints/:id" element={<ComplaintDetailsPage />} />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/submit" element={<SubmitComplaintPage />} />
        <Route path="/student/complaints" element={<MyComplaintsPage />} />
        <Route path="/student/surveys" element={<SurveysPage />} />
        <Route path="/student/notifications" element={<NotificationsPage />} />
        <Route path="/student/profile" element={<ProfilePage />} />

        {/* Department Admin Routes */}
        <Route path="/dept/queue" element={<DeptQueuePage />} />
        <Route path="/dept/kanban" element={<KanbanBoardPage />} />
        <Route path="/dept/reports" element={<DeptReportsPage />} />

        {/* Management Routes */}
        <Route path="/management/analytics" element={<ManagementAnalyticsPage />} />
        <Route path="/management/surveys" element={<ManagementSurveysPage />} />
        <Route path="/management/ai-reports" element={<AIReportsPage />} />
        <Route path="/management/heatmaps" element={<CampusHeatmapsPage />} />

        {/* Super Admin Routes */}
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
        <Route path="/admin/settings" element={<SystemSettingsPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to={getDefaultRedirect()} replace />} />
    </Routes>
  );
};
