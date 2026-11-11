import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingState } from '../../components/feedback/LoadingState';
import type { UserRole } from '../../types/user';

interface RoleGuardProps {
  allow: UserRole[];
  /** When true, teacher must also be approved (checks instructor_status). */
  requireApprovedTeacher?: boolean;
  fallback?: string;
}

export function RoleGuard({
  allow,
  requireApprovedTeacher = false,
  fallback = '/',
}: RoleGuardProps) {
  const { loading, isAuthenticated, role, isApprovedTeacher } = useAuth();

  if (loading) return <LoadingState message="Checking your permissions…" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!role || !allow.includes(role)) return <Navigate to={fallback} replace />;
  if (requireApprovedTeacher && role === 'teacher' && !isApprovedTeacher) {
    return <Navigate to="/teacher/dashboard" replace />;
  }
  return <Outlet />;
}