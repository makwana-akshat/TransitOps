import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppAuth } from '../context/AuthContext';

export const PermissionGuard = ({ requiredPermission, children }) => {
  const { isLoaded, isSignedIn, authLoading, permissions } = useAppAuth();

  if (!isLoaded || authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  if (permissions.includes("*") || permissions.includes(requiredPermission)) {
    return children ? children : <Outlet />;
  }

  return <Navigate to="/unauthorized" replace />;
};

export default PermissionGuard;
