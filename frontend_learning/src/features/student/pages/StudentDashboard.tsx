import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useStudentDashboard } from '../hooks/useStudentDashboard';
import { StatCard } from '../components/StatCard';
import { ContinueLearningCard } from '../components/ContinueLearningCard';
import { MyCourseCard } from '../components/MyCourseCard';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Button } from '../../../components/ui/Button';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { courses, stats, loading, error, refetch } = useStudentDashboard();

  if (loading) return <LoadingState message="Loading your dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const continueCourse = courses?.find((c) => (c.progress?.percentage ?? 0) < 100) || courses?.[0];
  const firstName = user?.full_name?.split(' ')[0] ?? 'Student';
  const activeCount = courses?.filter((c) => (c.progress?.percentage ?? 0) < 100).length ?? 0;

  return (
    <div className="mx-auto max-w-7xl space-y-12 pb-8">
      {/* Welcome Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-primary">
            Student Workspace
          </p>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-carbon sm:text-4xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1.5 text-sm font-medium text-on-surface-variant sm:text-base">
            {activeCount > 0
              ? `You have ${activeCount} active ${activeCount === 1 ? 'course' : 'courses'} in progress. Keep the momentum going.`
              : 'Track your milestones, pick up where you left off, and explore new skills.'}
          </p>
        </div>

        <Link to="/student/courses" className="self-start sm:self-auto">
          <Button className="inline-flex items-center gap-2 rounded-full bg-carbon px-6 py-3 text-sm font-bold text-white transition-all hover:bg-carbon-light">
            <span>Explore Catalog</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Button>
        </Link>
      </header>

      {/* Stats Bento Grid - 50/50 Asymmetrical Split */}
      <section aria-label="Learning statistics" className="grid gap-6 md:grid-cols-2">
        {/* Left Side: Featured Hero Lilac Card */}
        <div className="h-full">
          <StatCard
            size="featured"
            title="Courses Enrolled"
            value={stats.totalEnrolled}
            subtitle={activeCount > 0 ? `${activeCount} in progress` : undefined}
            variant="primary"
            icon={
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            }
          />
        </div>

        {/* Right Side: 2 Compact Horizontal Cards */}
        <div className="flex h-full flex-col gap-6">
          <StatCard
            size="compact"
            title="Courses Completed"
            value={stats.totalCompleted}
            variant="secondary"
            icon={
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            size="compact"
            title="Lessons Completed"
            value={stats.totalLessonsCompleted}
            variant="tertiary"
            icon={
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Continue Learning */}
      {continueCourse && (
        <section>
          <div className="mb-5 flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <h2 className="text-2xl font-extrabold tracking-tight text-carbon">
              Continue Learning
            </h2>
          </div>
          <ContinueLearningCard data={continueCourse} />
        </section>
      )}

      {/* My Courses */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold tracking-tight text-carbon">
              My Courses
            </h2>
            {courses && courses.length > 0 && (
              <span className="rounded-full bg-primary-container px-3 py-0.5 text-xs font-extrabold text-on-primary-container">
                {courses.length}
              </span>
            )}
          </div>

          {courses && courses.length > 0 && (
            <Link
              to="/student/my-learning"
              className="group inline-flex items-center gap-1.5 rounded-full bg-surface-container-lowest px-4 py-2 text-sm font-bold text-primary shadow-[0_8px_24px_rgba(18,18,20,0.04)] transition-colors hover:text-on-primary-container"
            >
              <span>View all</span>
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Link>
          )}
        </div>

        {!courses || courses.length === 0 ? (
          <div className="flex flex-col items-center rounded-[2rem] border border-surface-container bg-surface-container-lowest px-6 py-16 text-center shadow-[0_8px_24px_rgba(18,18,20,0.04)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="mt-5 text-xl font-extrabold text-carbon">No courses yet</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-on-surface-variant">
              You are not enrolled in any courses yet. Browse our catalog to start your learning journey.
            </p>
            <div className="mt-7">
              <Link to="/student/courses">
                <Button className="rounded-full bg-carbon px-8 py-3 font-bold text-white transition-colors hover:bg-carbon-light">
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.slice(0, 4).map((c) => (
              <MyCourseCard key={c.course.id} data={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}