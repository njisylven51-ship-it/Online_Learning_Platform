import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
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
  const location = useLocation();
  const { user, isAuthenticated, role } = useAuth();

  const { data: course, loading, error, refetch } = useCourseDetails(courseId);
  const { data: instructor } = useInstructorProfile(course?.instructor_id ?? '');
  const { data: myEnrolments, refetch: refetchEnrolments } = useMyEnrolments();
  const { enrol, loading: enrolling, error: enrolError } = useEnrol();

  // If is_active is missing, assume it is true.
  const enrolled =
    !!myEnrolments?.some((e) => e.course_id === courseId && e.is_active !== false);

  if (loading) return <LoadingState message="Loading course…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!course) return <EmptyState title="Course not found" />;

  const isFree = course.price_xaf === 0;

  // Keep the user inside the student dashboard if they are a student
  const backLink = role === 'student' && location.pathname.startsWith('/student') 
    ? '/student/courses' 
    : '/courses';

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
          <Button className="w-full rounded-full bg-carbon py-3.5 text-base font-extrabold text-white hover:bg-carbon-light">
            Sign in to enrol
          </Button>
        </Link>
      );
    }
    if (role === 'teacher' || role === 'administrator') {
      return (
        <p className="text-sm font-medium text-on-surface-variant">
          You are signed in as {role}. Course enrolment is available to students.
        </p>
      );
    }
    if (enrolled) {
      return (
        <Link to={`/student/classroom/${course.id}`}>
          <Button className="w-full rounded-full bg-secondary-container py-3.5 text-base font-extrabold text-on-secondary-container hover:bg-secondary-container/80">
            Continue learning
          </Button>
        </Link>
      );
    }
    if (isFree) {
      return (
        <Button 
          onClick={handleEnrol} 
          disabled={enrolling} 
          className="w-full rounded-full bg-carbon py-3.5 text-base font-extrabold text-white hover:bg-carbon-light disabled:opacity-50"
        >
          {enrolling ? 'Enrolling…' : 'Enrol for free'}
        </Button>
      );
    }
    return (
      <Button
        onClick={() => navigate(`/student/payments/checkout/${course.id}`)}
        className="w-full rounded-full bg-carbon py-3.5 text-base font-extrabold text-white hover:bg-carbon-light"
      >
        Buy for {formatCurrency(course.price_xaf)}
      </Button>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Back Link */}
      <Link to={backLink} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-on-primary-container transition">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to courses
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            {/* Badges */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-bold text-on-surface-variant">
                {LEVEL_LABEL[course.level] ?? course.level}
              </span>
              {isFree ? (
                <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container">Free</span>
              ) : (
                <span className="rounded-full bg-primary-container px-3 py-1 text-xs font-bold text-on-primary-container">
                  {formatCurrency(course.price_xaf)}
                </span>
              )}
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-carbon">{course.title}</h1>
            {instructor && (
              <p className="mt-3 text-base font-medium text-on-surface-variant">
                By <span className="font-bold text-carbon">{instructor.full_name}</span>
              </p>
            )}
          </div>

          <div className="rounded-[2rem] border border-surface-container bg-surface-container-lowest p-8 shadow-[0_8px_24px_rgba(18,18,20,0.04)]">
            <h2 className="mb-4 text-xl font-extrabold text-carbon">About this course</h2>
            <p className="whitespace-pre-line text-base font-medium leading-relaxed text-on-surface-variant">
              {course.description || 'No description provided.'}
            </p>
          </div>

          {instructor && (instructor.bio || instructor.qualifications) && (
            <div className="rounded-[2rem] border border-surface-container bg-surface-container-lowest p-8 shadow-[0_8px_24px_rgba(18,18,20,0.04)]">
              <h2 className="mb-4 text-xl font-extrabold text-carbon">About the instructor</h2>
              <p className="text-base font-bold text-carbon">{instructor.full_name}</p>
              {instructor.bio && (
                <p className="mt-2 whitespace-pre-line text-sm font-medium text-on-surface-variant">{instructor.bio}</p>
              )}
              {instructor.qualifications && (
                <div className="mt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-outline">Qualifications</span>
                  <p className="mt-1 text-sm font-medium text-on-surface-variant">{instructor.qualifications}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-surface-container bg-surface-container-lowest p-8 shadow-[0_8px_24px_rgba(18,18,20,0.04)]">
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Course Price</p>
            <p className="mt-2 text-4xl font-black text-primary">
              {formatCurrency(course.price_xaf)}
            </p>
            <div className="mt-6">
              {renderAction()}
            </div>
            {enrolError && (
              <p className="mt-4 text-sm font-bold text-error">{enrolError}</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}