import { Link } from 'react-router-dom';
import { useStudentDashboard } from '../hooks/useStudentDashboard';
import { PageHeader } from '../../../components/common/PageHeader';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button } from '../../../components/ui/Button';

export default function StudentProgress() {
  const { courses, stats, loading, error, refetch } = useStudentDashboard();

  if (loading) return <LoadingState message="Loading progress…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const overallPercentage =
    courses && courses.length > 0
      ? Math.round(
          courses.reduce((acc, c) => acc + (c.progress?.percentage ?? 0), 0) /
            courses.length
        )
      : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-8">
      <PageHeader
        title="My Progress"
        subtitle="Track your learning journey across all your courses."
      />

      {!courses || courses.length === 0 ? (
        <EmptyState
          title="No progress to track"
          description="Enrol in a course to start tracking your progress."
          action={
            <Link to="/student/courses">
              <Button className="rounded-full bg-carbon text-white hover:bg-carbon-light px-8 py-3">
                Browse Courses
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          {/* Overall Summary Strip */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            <div className="rounded-[1.5rem] bg-primary-container p-6 shadow-[0_8px_24px_rgba(210,189,246,0.3)]">
              <p className="text-xs font-bold uppercase tracking-wider text-on-primary-container/80">
                Overall Mastery
              </p>
              <p className="mt-2 text-3xl font-extrabold text-on-primary-container">
                {overallPercentage}%
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-surface-container bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(18,18,20,0.04)]">
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Enrolled
              </p>
              <p className="mt-2 text-3xl font-extrabold text-carbon">
                {stats?.totalEnrolled ?? courses.length}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-surface-container bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(18,18,20,0.04)]">
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Completed
              </p>
              <p className="mt-2 text-3xl font-extrabold text-carbon">
                {stats?.totalCompleted ??
                  courses.filter((c) => (c.progress?.percentage ?? 0) === 100).length}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-surface-container bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(18,18,20,0.04)]">
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Lessons Done
              </p>
              <p className="mt-2 text-3xl font-extrabold text-carbon">
                {stats?.totalLessonsCompleted ?? 0}
              </p>
            </div>
          </div>

          {/* Course Progress List */}
          <div className="space-y-5">
            {courses.map((c) => {
              const pct = Math.round(c.progress?.percentage ?? 0);
              const isComplete = pct === 100;
              const isNotStarted = pct === 0;
              const completedLessons = c.progress?.completed_lessons ?? 0;
              const totalLessons = c.progress?.total_lessons ?? 0;
              const initials = (c.course.slug || c.course.title || 'CO')
                .slice(0, 2)
                .toUpperCase();

              return (
                <article
                  key={c.course.id}
                  className="group rounded-[2rem] border border-surface-container bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(18,18,20,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(210,189,246,0.25)] sm:p-8"
                >
                  <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                    {/* Left: Course Monogram + Title + Lesson Fraction */}
                    <div className="flex items-start gap-5 sm:items-center">
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold shadow-sm transition-transform duration-300 group-hover:scale-105 ${
                        isComplete 
                          ? 'bg-secondary-container text-on-secondary-container' 
                          : 'bg-primary-container text-on-primary-container'
                      }`}>
                        {initials}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold leading-snug text-carbon transition-colors group-hover:text-primary">
                            {c.course.title}
                          </h3>
                          
                          {/* Status Badge */}
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                              isComplete
                                ? 'bg-secondary-container text-on-secondary-container'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            {isComplete ? (
                              <>
                                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                </svg>
                                Completed
                              </>
                            ) : isNotStarted ? (
                              'Not started'
                            ) : (
                              'In progress'
                            )}
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-medium text-on-surface-variant">
                          <span className="font-bold text-carbon">
                            {completedLessons}
                          </span>{' '}
                          of {totalLessons} lessons completed
                        </p>
                      </div>
                    </div>

                    {/* Right: CTA Button */}
                    <Link
                      to={`/student/classroom/${c.course.id}`}
                      className="self-start sm:self-center"
                    >
                      <Button 
                        className={`gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition ${
                          isComplete
                            ? 'bg-surface-container text-carbon hover:bg-surface-container-high'
                            : 'bg-carbon text-white hover:bg-carbon-light'
                        }`}
                      >
                        <span>
                          {isComplete
                            ? 'Review Course'
                            : isNotStarted
                            ? 'Start Learning'
                            : 'Continue'}
                        </span>
                        <svg
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </Button>
                    </Link>
                  </div>

                  {/* Progress Track */}
                  <div className="mt-6 border-t border-surface-container pt-5">
                    <div className="mb-2.5 flex items-center justify-between text-xs">
                      <span className="font-bold uppercase tracking-wider text-on-surface-variant">
                        Completion
                      </span>
                      <span className={`font-extrabold ${isComplete ? 'text-secondary' : 'text-primary'}`}>
                        {pct}%
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${c.course.title} completion`}
                      className="h-2.5 w-full overflow-hidden rounded-full bg-surface-container"
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                          isComplete ? 'bg-secondary' : 'bg-primary'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}