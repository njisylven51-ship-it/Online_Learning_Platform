import { Link, useNavigate, useParams } from 'react-router-dom';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { useCourseDetails } from '../hooks/useCourseDetails';
import { useInstructorProfile } from '../hooks/useInstructorProfile';
import { useMyEnrolments } from '../../enrolments/hooks/useMyEnrolments';
import { useEnrol } from '../../enrolments/hooks/useEnrol';
import { formatCurrency } from '../../../utils/formatCurrency';

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export default function CourseDetails() {
  const { courseId = '' } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, role } = useAuth();

  const { data: course, loading, error, refetch } = useCourseDetails(courseId);
  const { data: instructor } = useInstructorProfile(course?.instructor_id ?? '');
  const { data: myEnrolments, refetch: refetchEnrolments } = useMyEnrolments();
  const { enrol, loading: enrolling, error: enrolError } = useEnrol();

  const enrolled =
    !!myEnrolments?.some((e) => e.course_id === courseId && e.is_active);

  if (loading) return <LoadingState message="Loading course…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!course) return <EmptyState title="Course not found" />;

  const isFree = course.price_xaf === 0;

  async function handleEnrol() {
    if (!course) return;
    await enrol(course.id);
    await refetchEnrolments();
    navigate(`/student/classroom/${course.id}`);
  }

  function renderAction() {
    if (!isAuthenticated) {
      return (
        <Link to="/login">
          <Button size="lg">Sign in to enrol</Button>
        </Link>
      );
    }
    if (role === 'teacher' || role === 'administrator') {
      return (
        <p className="text-sm text-ink-muted">
          You are signed in as {role}. Course enrolment is available to students.
        </p>
      );
    }
    if (enrolled) {
      return (
        <Link to={`/student/classroom/${course.id}`}>
          <Button size="lg">Continue learning</Button>
        </Link>
      );
    }
    if (isFree) {
      return (
        <Button size="lg" onClick={handleEnrol} disabled={enrolling}>
          {enrolling ? 'Enrolling…' : 'Enrol for free'}
        </Button>
      );
    }
    return (
      <Button
        size="lg"
        onClick={() => navigate(`/student/payments/checkout/${course.id}`)}
      >
        Buy for {formatCurrency(course.price_xaf)}
      </Button>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/courses" className="text-sm font-medium text-accent hover:underline">
        ← Back to courses
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge tone="neutral">{LEVEL_LABEL[course.level] ?? course.level}</Badge>
              {isFree ? (
                <Badge tone="success">Free</Badge>
              ) : (
                <Badge tone="info">{formatCurrency(course.price_xaf)}</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-forest">{course.title}</h1>
            {instructor && (
              <p className="mt-2 text-sm text-ink-muted">
                By <span className="font-medium text-forest">{instructor.full_name}</span>
              </p>
            )}
          </div>

          <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-forest">About this course</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-muted">
              {course.description || 'No description provided.'}
            </p>
          </div>

          {instructor && (instructor.bio || instructor.qualifications) && (
            <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-forest">About the instructor</h2>
              <p className="text-sm font-medium text-forest">{instructor.full_name}</p>
              {instructor.bio && (
                <p className="mt-2 whitespace-pre-line text-sm text-ink-muted">{instructor.bio}</p>
              )}
              {instructor.qualifications && (
                <p className="mt-2 text-sm text-ink-muted">
                  <span className="font-medium text-forest">Qualifications:</span>{' '}
                  {instructor.qualifications}
                </p>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
            <p className="text-3xl font-bold text-forest">
              {formatCurrency(course.price_xaf)}
            </p>
            <div className="mt-4">{renderAction()}</div>
            {enrolError && (
              <p className="mt-3 text-sm text-red-600">{enrolError}</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}