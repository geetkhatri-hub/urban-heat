import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore, UserRole } from '../store/store';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const role = useAppStore((state) => state.role);

  // If role is null or not in allowed list, redirect to root portal selection screen
  if (!role || !allowedRoles.includes(role)) {
    console.warn(`[ProtectedRoute] Unauthorized access attempt: active role is [${role}], required roles [${allowedRoles.join(', ')}]`);
    return <Navigate to="/" replace />;
  }

  return children;
};
