import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If not permitted, redirect to user's permitted role dashboard
    if (role === 'dept_admin') return <Navigate to="/dept/queue" replace />;
    if (role === 'management') return <Navigate to="/management/analytics" replace />;
    if (role === 'superadmin') return <Navigate to="/admin/users" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Outlet />;
};
