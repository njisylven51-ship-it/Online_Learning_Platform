import { Link } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useAdminDashboard } from '../../../admin/hooks/useAdminDashboard';
import { StatCard } from '../../../dashboard/student/components/StatCard';
import { LoadingState } from '../../../../components/feedback/LoadingState';
import { Button } from '../../../../components/ui/Button';

export default function AdminHome() {
  const { user } = useAuth();
  const { stats, loading } = useAdminDashboard();

  if (loading) return <LoadingState message="Loading dashboard…" />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-forest md:text-3xl">Administrator Dashboard</h1>
        <p className="mt-1 text-ink-muted">Welcome back, {user?.full_name}. Here is your platform overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={stats?.total_users ?? 0} icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
        <StatCard title="Total Courses" value={stats?.total_courses ?? 0} icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} />
        <StatCard title="Pending Teachers" value={stats?.pending_teacher_applications ?? 0} icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
        <StatCard title="Pending Courses" value={stats?.pending_course_reviews ?? 0} icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/admin/instructors"><Button>Review Instructor Applications</Button></Link>
        <Link to="/admin/courses"><Button variant="secondary">Moderate Pending Courses</Button></Link>
      </div>
    </div>
  );
}