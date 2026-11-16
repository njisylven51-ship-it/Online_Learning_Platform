import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStudentDashboard } from '../hooks/useStudentDashboard';
import { MyCourseCard } from '../components/MyCourseCard';
import { PageHeader } from '../../../components/common/PageHeader';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button } from '../../../components/ui/Button';

type FilterTab = 'all' | 'in-progress' | 'completed';

export default function StudentMyLearning() {
  const { courses, loading, error, refetch } = useStudentDashboard();
  const [filter, setFilter] = useState<FilterTab>('all');

  if (loading) return <LoadingState message="Loading your courses…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const completedCount = courses?.filter((c) => (c.progress?.percentage ?? 0) === 100).length ?? 0;
  const inProgressCount = (courses?.length ?? 0) - completedCount;

  const filteredCourses = courses?.filter((c) => {
    const pct = c.progress?.percentage ?? 0;
    if (filter === 'in-progress') return pct < 100;
    if (filter === 'completed') return pct === 100;
    return true;
  });

  return (
    <div className="w-full space-y-8 pb-10">
      <PageHeader
        title="My Learning"
        subtitle="All the courses you are enrolled in, tracked in one place."
        action={
          <Link to="/student/courses">
            <Button variant="secondary" size="sm" className="gap-2">
              <span>Browse More Courses</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Button>
          </Link>
        }
      />

      {!courses || courses.length === 0 ? (
        <EmptyState
          title="Your library is empty"
          description="You haven't enrolled in any courses yet. Explore our catalog to get started."
          action={
            <Link to="/student/courses">
              <Button>Explore Courses</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Filter Toolbar / Category Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-container pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all ${
                  filter === 'all'
                    ? 'bg-carbon text-white shadow-sm'
                    : 'bg-transparent text-on-surface-variant hover:bg-surface-container/50'
                }`}
              >
                All Courses ({courses.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('in-progress')}
                className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all ${
                  filter === 'in-progress'
                    ? 'bg-carbon text-white shadow-sm'
                    : 'bg-transparent text-on-surface-variant hover:bg-surface-container/50'
                }`}
              >
                In Progress ({inProgressCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('completed')}
                className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all ${
                  filter === 'completed'
                    ? 'bg-carbon text-white shadow-sm'
                    : 'bg-transparent text-on-surface-variant hover:bg-surface-container/50'
                }`}
              >
                Completed ({completedCount})
              </button>
            </div>

            <span className="text-xs font-bold text-outline">
              Showing {filteredCourses?.length ?? 0} of {courses.length} courses
            </span>
          </div>

          {/* Full-Width Responsive Grid */}
          {filteredCourses && filteredCourses.length > 0 ? (
            <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {filteredCourses.map((c) => (
                <div key={c.course.id} className="flex h-full flex-col">
                  <MyCourseCard data={c} />
                </div>
              ))}
            </div>
          ) : (
            // Removed dotted/dashed borders here
            <div className="flex w-full flex-col items-center justify-center p-12 text-center">
              <h3 className="text-lg font-bold text-carbon">No courses found</h3>
              <p className="mt-1 text-sm text-on-surface-variant">
                You don't have any courses matching this filter category.
              </p>
              <button
                type="button"
                onClick={() => setFilter('all')}
                className="mt-4 text-xs font-extrabold text-primary hover:underline"
              >
                View all courses
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}