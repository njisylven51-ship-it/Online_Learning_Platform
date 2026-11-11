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

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Progress" 
        subtitle="Track your learning journey across all your courses." 
      />

      {!courses || courses.length === 0 ? (
        <EmptyState
          title="No progress to track"
          description="Enrol in a course to start tracking your progress."
          action={<Link to="/courses"><Button>Browse Courses</Button></Link>}
        />
      ) : (
        <div className="space-y-4">
          {courses.map((c) => {
            const pct = c.progress?.percentage ?? 0;
            const isComplete = pct === 100;
            
            return (
              <div key={c.course.id} className="rounded-xl border border-line bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-lg font-bold text-forest">{c.course.title}</h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      {c.progress?.completed_lessons ?? 0} of {c.progress?.total_lessons ?? 0} lessons completed
                    </p>
                  </div>
                  <Link to={`/student/classroom/${c.course.id}`}>
                    <Button variant="secondary" size="sm">
                      {isComplete ? 'Review' : 'Continue'}
                    </Button>
                  </Link>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs font-medium text-forest">
                    <span>Progress</span>
                    <span>{Math.round(pct)}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-forest-tint">
                    <div
                      className="h-full bg-accent transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}