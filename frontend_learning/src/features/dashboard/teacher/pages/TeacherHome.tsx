import { Link } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useTeacherDashboard } from '../../../teacher/hooks/useTeacherDashboard';
import { useMyCourses } from '../../../teacher/hooks/useMyCourses';
import { StatCard } from '../../../student/components/StatCard';
import { TeacherCourseCard } from '../../../teacher/components/TeacherCourseCard';
import { LoadingState } from '../../../../components/feedback/LoadingState';
import { Button } from '../../../../components/ui/Button';

export default function TeacherHome() {
  const { user, isApprovedTeacher } = useAuth();
  const { stats, loading: statsLoading } = useTeacherDashboard();
  const { data: courses, loading: coursesLoading } = useMyCourses();

  const status = user?.instructor_status ?? 'pending';
  const firstName = user?.full_name?.split(' ')[0] ?? 'Teacher';
  const recentCourses = courses?.slice(0, 4) ?? [];

  return (
<div className="space-y-8 pb-12">
      {/* Welcome Hero Card */}
      <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-[0_10px_30px_rgba(18,18,20,0.04)] sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {status === 'approved' ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#CCF3CE] px-3.5 py-1.5 text-xs font-bold tracking-tight text-[#111111]">
                  <span className="h-2 w-2 rounded-full bg-[#111111]" />
                  Approved Instructor
                </span>
              ) : status === 'rejected' ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#FFE2E5] px-3.5 py-1.5 text-xs font-bold tracking-tight text-[#111111]">
                  <span className="h-2 w-2 rounded-full bg-[#E11D48]" />
                  Application Rejected
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#FDEBC8] px-3.5 py-1.5 text-xs font-bold tracking-tight text-[#111111]">
                  <span className="h-2 w-2 rounded-full bg-[#111111] animate-pulse" />
                  Pending Approval
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/teacher/courses/create">
              <Button className="inline-flex items-center gap-2 rounded-full bg-carbon px-6 py-3 text-sm font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-carbon-light">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Create Course</span>
              </Button>
            </Link>

            <Link
              to="/teacher/assignments"
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-carbon shadow-sm hover:bg-surface-container hover:text-primary"
            >
              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Review Assignments</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Rejection / Pending Banner */}
      {!isApprovedTeacher && (
        <div
          role="alert"
          className={`flex items-start gap-3.5 rounded-2xl px-5 py-4 text-sm ${
            status === 'rejected'
              ? 'bg-error/10 text-error'
              : 'bg-primary-container/40 text-on-primary-container'
          }`}
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              status === 'rejected' ? 'bg-error/15 text-error' : 'bg-primary-container text-on-primary-container'
            }`}
          >
            {status === 'rejected' ? (
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>

          <div>
            <p className="font-extrabold">
              {status === 'rejected' ? 'Instructor Application Rejected' : 'Instructor Application Pending'}
            </p>
            <p className="mt-0.5 text-xs font-medium opacity-90">
              {status === 'rejected'
                ? user?.instructor_review_reason || 'No reason provided. Please contact support for more details.'
                : 'Your account is awaiting administrator approval. You can draft course content now, and publishing will unlock once approved.'}
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {statsLoading ? (
        <LoadingState message="Loading stats…" />
      ) : (
        <div className="grid gap-5 sm:grid-cols-3">
          <StatCard
            title="Total Courses"
            value={stats?.total_courses ?? 0}
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            }
          />
          <StatCard
            title="Total Students"
            value={stats?.total_students ?? 0}
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            }
          />
          <StatCard
            title="Pending Reviews"
            value={stats?.pending_reviews ?? 0}
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        </div>
      )}

      {/* Your Courses Section */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-carbon">Your Courses</h2>
            <p className="mt-0.5 text-xs font-medium text-on-surface-variant">
              Recently created and active courses in your curriculum.
            </p>
          </div>

          <Link
            to="/teacher/courses"
            className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-lowest px-4 py-2 text-xs font-bold text-carbon shadow-[0_4px_12px_rgba(18,18,20,0.03)] transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <span>View All</span>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {coursesLoading ? (
          <LoadingState message="Loading courses…" />
        ) : recentCourses.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-10 text-center shadow-[0_10px_30px_rgba(18,18,20,0.04)]">
            <div
              className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:14px_14px]"
              aria-hidden="true"
            />
            <div className="relative z-10 mx-auto max-w-md space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-carbon">No courses created yet</h3>
                <p className="mt-1 text-xs font-medium text-on-surface-variant">
                  Start building your first course to organize lessons, resources, and student assignments.
                </p>
              </div>
              <div className="pt-1">
                <Link to="/teacher/courses/create">
                  <Button className="inline-flex items-center gap-2 rounded-full bg-carbon px-6 py-2.5 text-xs font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-carbon-light">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>Create New Course</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recentCourses.map((c) => (
              <TeacherCourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}