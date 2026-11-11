import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '@/auth';
import { Role } from '@/auth';

interface ProtectedRouteProps {
  roles: any;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles }) => {
  const { hasRole, currentUser, isLoading } = useAuthContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!roles.some((role: any) => hasRole(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
