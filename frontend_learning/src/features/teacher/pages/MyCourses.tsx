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

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Courses"
        subtitle="Manage your curriculum, lessons, and assessments."
        action={
          isApprovedTeacher ? (
            <Link to="/teacher/courses/create">
              <Button>+ Create Course</Button>
            </Link>
          ) : (
            <Button disabled title="You must be an approved instructor">
              + Create Course
            </Button>
          )
        }
      />

      {!data || data.length === 0 ? (
        <EmptyState
          title="No courses yet"
          description={isApprovedTeacher ? "Start creating your first course." : "You cannot create courses until your application is approved."}
          action={isApprovedTeacher ? <Link to="/teacher/courses/create"><Button>Create Course</Button></Link> : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((c) => (
            <TeacherCourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}