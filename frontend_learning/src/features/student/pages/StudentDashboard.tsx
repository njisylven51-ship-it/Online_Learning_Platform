import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useStudentDashboard } from '../hooks/useStudentDashboard';
import { StatCard } from '../components/StatCard';
import { ContinueLearningCard } from '../components/ContinueLearningCard';
import { MyCourseCard } from '../components/MyCourseCard';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button } from '../../../components/ui/Button';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { courses, stats, loading, error, refetch } = useStudentDashboard();

  if (loading) return <LoadingState message="Loading your dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  // Find the most recently enrolled course to feature in "Continue Learning"
  // Assuming the enrolments array is ordered by most recent, we grab the first incomplete one.
  const continueCourse = courses?.find((c) => (c.progress?.percentage ?? 0) < 100) || courses?.[0];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-forest md:text-3xl">
          Welcome back, {user?.full_name?.split(' ')[0] ?? 'Student'} 👋
        </h1>
        <p className="mt-1 text-ink-muted">
          Here is an overview of your learning journey.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Courses Enrolled"
          value={stats.totalEnrolled}
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
        />
        <StatCard
          title="Courses Completed"
          value={stats.totalCompleted}
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          title="Lessons Completed"
          value={stats.totalLessonsCompleted}
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Continue Learning */}
      {continueCourse && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-forest">Continue Learning</h2>
          <ContinueLearningCard data={continueCourse} />
        </section>
      )}

      {/* My Courses */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-forest">My Courses</h2>
          <Link to="/student/my-learning" className="text-sm font-medium text-accent hover:underline">
            View all →
          </Link>
        </div>
        
        {!courses || courses.length === 0 ? (
          <EmptyState
            title="No courses yet"
            description="You are not enrolled in any courses. Start exploring to find your first one!"
            action={
              <Link to="/courses">
                <Button>Browse Courses</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.slice(0, 4).map((c) => (
              <MyCourseCard key={c.course.id} data={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}