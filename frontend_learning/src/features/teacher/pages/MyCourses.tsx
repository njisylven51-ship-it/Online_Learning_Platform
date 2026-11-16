import { Link } from 'react-router-dom';
import { useMyCourses } from '../hooks/useMyCourses';
import { useAuth } from '../../../contexts/AuthContext';
import { TeacherCourseCard } from '../components/TeacherCourseCard';
import { PageHeader } from '../../../components/common/PageHeader';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button } from '../../../components/ui/Button';

export default function MyCourses() {
  const { data, loading, error, refetch } = useMyCourses();
  const { isApprovedTeacher } = useAuth();

  if (loading) return <LoadingState message="Loading your courses…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const courses = data ?? [];
  const hasCourses = courses.length > 0;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="My Courses"
        subtitle="Manage your curriculum, lessons, and assessments."
        action={
          isApprovedTeacher ? (
            <Link to="/teacher/courses/create">
              <Button className="inline-flex items-center gap-2 rounded-full bg-carbon px-6 py-3 text-sm font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-carbon-light">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Create Course</span>
              </Button>
            </Link>
          ) : (
            <Button
              disabled
              title="You must be an approved instructor"
              className="inline-flex items-center gap-2 rounded-full bg-surface-container px-6 py-3 text-sm font-bold text-on-surface-variant opacity-60 cursor-not-allowed"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              <span>Create Course</span>
            </Button>
          )
        }
      />

      {/* Instructor Approval Notice Banner */}
      {!isApprovedTeacher && (
        <div
          role="status"
          className="flex flex-col items-start justify-between gap-3 rounded-2xl bg-primary-container/40 px-5 py-4 text-sm text-on-primary-container sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-extrabold">Instructor Application Pending</p>
              <p className="text-xs font-medium opacity-85">
                Course creation will unlock automatically once your instructor profile is approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State vs Course Grid */}
      {!hasCourses ? (
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-8 shadow-[0_10px_30px_rgba(18,18,20,0.04)] sm:p-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:14px_14px]"
            aria-hidden="true"
          />
          <div className="relative z-10">
            <EmptyState
              title="No courses yet"
              description={
                isApprovedTeacher
                  ? 'Start building your curriculum by creating your first course.'
                  : 'You cannot create courses until your instructor application is approved.'
              }
              action={
                isApprovedTeacher ? (
                  <Link to="/teacher/courses/create">
                    <Button className="inline-flex items-center gap-2 rounded-full bg-carbon px-7 py-3 text-sm font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-carbon-light">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      <span>Create First Course</span>
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Lightweight Curriculum Count Header */}
          <div className="flex items-center justify-between rounded-2xl bg-surface-container-lowest px-5 py-3.5 shadow-[0_6px_20px_rgba(18,18,20,0.03)]">
            <div className="flex items-center gap-2.5 text-sm font-bold text-carbon">
              <span className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-lg bg-primary/10 px-2 text-xs font-extrabold text-primary">
                {courses.length}
              </span>
              <span>{courses.length === 1 ? 'Course in your catalog' : 'Courses in your catalog'}</span>
            </div>

            <button
              type="button"
              onClick={refetch}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
              title="Refresh courses"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              <span>Refresh</span>
            </button>
          </div>

          {/* Courses Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((c) => (
              <TeacherCourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}