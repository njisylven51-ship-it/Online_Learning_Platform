import { useAuth } from '../../../../contexts/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-forest">
        Welcome back, {user?.full_name ?? 'student'} 👋
      </h1>
      <p className="text-ink-muted">
        Your learning overview will appear here once the classroom and enrolment
        features are wired up.
      </p>
    </div>
  );
}