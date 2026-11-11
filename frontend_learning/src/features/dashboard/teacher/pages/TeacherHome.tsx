import { useAuth } from '../../../../contexts/AuthContext';
import { Badge } from '../../../../components/ui/Badge';
import { Link } from 'react-router-dom';

export default function TeacherHome() {
  const { user, isApprovedTeacher } = useAuth();

  const status = user?.instructor_status ?? 'pending';
  const tone = status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning';
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-forest">
          Welcome, {user?.full_name ?? 'instructor'}
        </h1>
        <Badge tone={tone}>Instructor status: {label}</Badge>
      </div>

      {!isApprovedTeacher && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {status === 'rejected' ? (
            <>
              Your application was rejected.
              {user?.instructor_review_reason && (
                <>
                  {' '}
                  <strong>Reason:</strong> {user.instructor_review_reason}
                </>
              )}
            </>
          ) : (
            <>
              Your application is awaiting administrator review. You can prepare
              course content once it is approved.
            </>
          )}
        </div>
      )}

      {isApprovedTeacher && (
        <p className="text-ink-muted">
          You&apos;re approved. Start by creating your first course on{' '}
          <Link to="/teacher/courses" className="text-accent hover:underline">
            My Courses
          </Link>
          .
        </p>
      )}
    </div>
  );
}