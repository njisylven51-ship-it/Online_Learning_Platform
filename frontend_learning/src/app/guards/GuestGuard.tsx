import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingState } from '../../components/feedback/LoadingState';
import type { UserRole } from '../../types/user';

function dashboardFor(role: UserRole | null): string {
  switch (role) {
    case 'teacher': return '/teacher/dashboard';
    case 'administrator': return '/admin/dashboard';
    case 'student':
    default: return '/student/dashboard';
  }
}

export function GuestGuard() {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) return <LoadingState message="Checking your session…" />;
  if (isAuthenticated) return <Navigate to={dashboardFor(role)} replace />;
  return <Outlet />;
}