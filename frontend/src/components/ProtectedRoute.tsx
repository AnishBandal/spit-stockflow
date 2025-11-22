import { Navigate } from 'react-router-dom';
import { getCurrentUser, permissions } from '@/lib/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePermission?: (role: string) => boolean;
}

export const ProtectedRoute = ({ children, requirePermission }: ProtectedRouteProps) => {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requirePermission && !requirePermission(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
