import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { Role } from '@property-portal/shared';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: Role[];
}

export default function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  const redirectTo = `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (roles && role && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
