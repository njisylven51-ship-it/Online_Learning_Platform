import { Link } from 'react-router-dom';
import { useStudentDashboard } from '../hooks/useStudentDashboard';
import { MyCourseCard } from '../components/MyCourseCard';
import { PageHeader } from '../../../components/common/PageHeader';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button } from '../../../components/ui/Button';

export default function StudentMyLearning() {
  const { courses, loading, error, refetch } = useStudentDashboard();

  if (loading) return <LoadingState message="Loading your courses…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Learning"
        subtitle="teacherServiceAll the courses you are enrolled in."
        action={
          <Link to="/courses">
            <Button variant="secondary" size="sm">Browse More Courses</Button>
          </Link>
        }
      />

      {!courses || courses.length === 0 ? (
        <EmptyState
          title="Your library is empty"
          description="You haven't enrolled in any courses yet. Explore our catalog to get started."
          action={
            <Link to="/courses">
              <Button>Explore Courses</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((c) => (
            <MyCourseCard key={c.course.id} data={c} />
          ))}
        </div>
      )}
    </div>
  );
}