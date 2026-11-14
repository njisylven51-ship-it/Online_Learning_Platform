import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCourseDetails } from '../../courses/hooks/useCourseDetails';
import { useMyEnrolments } from '../../enrolments/hooks/useMyEnrolments'; // <-- Ensure this is imported
import { useCreatePayment } from '../hooks/useCreatePayment';
import { useVerifyPayment } from '../hooks/useVerifyPayment';
import { SimulatorBanner } from '../components/SimulatorBanner';
import { PaymentForm } from '../components/PaymentForm';
import { PaymentStatusDisplay } from '../components/PaymentStatus';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatCurrency';
import type { Payment, PaymentProvider, PaymentStatus } from '../types';

export default function PaymentCheckout() {
  const { courseId = '' } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const { data: course, loading: courseLoading, error: courseError } = useCourseDetails(courseId);
  
  // Get the refetch function for enrolments
  const { data: myEnrolments, loading: enrolmentsLoading, refetch: refetchEnrolments } = useMyEnrolments();
  
  const { create, loading: creating, error: createError } = useCreatePayment();
  const { verify, loading: verifying, error: verifyError } = useVerifyPayment();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const alreadyEnrolled = myEnrolments?.some((e) => e.course_id === courseId && e.is_active);

  useEffect(() => {
    if (alreadyEnrolled && !status) {
      navigate(`/student/classroom/${courseId}`, { replace: true });
    }
  }, [alreadyEnrolled, courseId, navigate, status]);

  if (courseLoading || enrolmentsLoading) return <LoadingState message="Checking access…" />;
  if (courseError) return <ErrorState message={courseError} />;
  if (!course) return <ErrorState message="Course not found." />;

  if (alreadyEnrolled && !status) {
    return (
      <div className="mx-auto max-w-lg py-12">
        <EmptyState 
          title="Already Enrolled"
          description="You already have access to this course."
          action={
            <Link to={`/student/classroom/${courseId}`}>
              <Button>Go to Classroom</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const handleSubmit = async (provider: PaymentProvider, phone: string) => {
    setError(null);
    setStatus('pending');
    try {
      const created = await create({
        course_id: course.id,
        provider,
        phone_number: phone,
      });
      setPayment(created);

      const verified = await verify(created.id);
      setStatus(verified.status);
      
      if (verified.status === 'succeeded') {
        // 🚨 CRITICAL FIX: Tell the frontend to re-fetch enrolments from the backend
        await refetchEnrolments(); 
      }
    } catch (e) {
      setStatus(null);
      setError('Verification failed or timed out. Please try again.');
    }
  };

  const handleReset = () => {
    setPayment(null);
    setStatus(null);
    setError(null);
  };

  const isProcessing = creating || verifying;

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <Link to={`/courses/${course.id}`} className="text-sm font-medium text-accent hover:underline">
        ← Back to course
      </Link>

      <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-forest">Checkout</h1>
        <p className="mt-1 text-sm text-ink-muted">{course.title}</p>
        <p className="mt-4 text-3xl font-black text-forest">
          {formatCurrency(course.price_xaf)}
        </p>
      </div>

      <SimulatorBanner />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {status === 'pending' ? (
        <PaymentStatusDisplay status="pending" onRetry={handleReset} onGoToCourse={() => {}} />
      ) : status === 'succeeded' ? (
        <PaymentStatusDisplay
          status="succeeded"
          onRetry={handleReset}
          onGoToCourse={() => navigate(`/student/classroom/${course.id}`)}
        />
      ) : status === 'failed' ? (
        <PaymentStatusDisplay status="failed" onRetry={handleReset} onGoToCourse={() => {}} />
      ) : (
        <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
          <PaymentForm onSubmit={handleSubmit} loading={isProcessing} />
          {createError && <p className="mt-2 text-sm text-red-600">{createError}</p>}
          {verifyError && <p className="mt-2 text-sm text-red-600">{verifyError}</p>}
        </div>
      )}
    </div>
  );
}