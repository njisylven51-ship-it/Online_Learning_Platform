import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTeacherDashboard } from '../../teacher/hooks/useTeacherDashboard';
import { useMyCourses } from '../../teacher/hooks/useMyCourses';
import { StatCard } from '../../student/components/StatCard'; // Reuse the student stat card
import { TeacherCourseCard } from '../../teacher/components/TeacherCourseCard';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

export default function TeacherHome() {
  const { user, isApprovedTeacher } = useAuth();
  const { stats, loading: statsLoading } = useTeacherDashboard();
  const { data: courses, loading: coursesLoading } = useMyCourses();

  const status = user?.instructor_status ?? 'pending';
  const tone = status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning';

  return (
    <div className="space-y-8">
      {/* Header & Status */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest md:text-3xl">
            Teacher Dashboard
          </h1>
          <p className="mt-1 text-ink-muted">Welcome back, {user?.full_name}</p>
        </div>
        <Badge tone={tone} className="w-fit text-sm">
          Status: {status.toUpperCase()}
        </Badge>
      </div>

      {/* Rejection / Pending Banner */}
      {!isApprovedTeacher && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {status === 'rejected' ? (
            <>
              <strong>Application Rejected:</strong> {user?.instructor_review_reason || 'No reason provided.'}
            </>
          ) : (
            <>
              <strong>Application Pending:</strong> Your account is awaiting administrator approval. You can prepare content, but it cannot be published yet.
            </>
          )}
        </div>
      )}

      {/* Stats */}
      {statsLoading ? (
        <LoadingState message="Loading stats…" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Courses"
            value={stats?.total_courses ?? 0}
            icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
          />
          <StatCard
            title="Total Students"
            value={stats?.total_students ?? 0}
            icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          />
          <StatCard
            title="Pending Reviews"
            value={stats?.pending_reviews ?? 0}
            icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>
      )}

      {/* My Courses */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-forest">My Courses</h2>
          <Link to="/teacher/courses">
            <Button variant="secondary" size="sm">View All</Button>
          </Link>
        </div>
        {coursesLoading ? (
          <LoadingState message="Loading courses…" />
        ) : courses?.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-forest-tint p-8 text-center text-sm text-ink-muted">
            No courses created yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses?.slice(0, 4).map((c) => (
              <TeacherCourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}