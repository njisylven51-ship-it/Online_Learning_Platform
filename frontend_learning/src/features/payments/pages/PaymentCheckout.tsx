import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCourseDetails } from '../../courses/hooks/useCourseDetails';
import { useMyEnrolments } from '../../enrolments/hooks/useMyEnrolments';
import { useCreatePayment } from '../hooks/useCreatePayment';
import { useVerifyPayment } from '../hooks/useVerifyPayment';
import { SimulatorBanner } from '../components/SimulatorBanner';
import { PaymentForm } from '../components/PaymentForm';
import { PaymentStatusDisplay } from '../components/PaymentStatus';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { formatCurrency } from '../../../utils/formatCurrency';
import type { Payment, PaymentProvider, PaymentStatus } from '../types';

export default function PaymentCheckout() {
  const { courseId = '' } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const { data: course, loading: courseLoading, error: courseError } = useCourseDetails(courseId);
  const { refetch: refetchEnrolments } = useMyEnrolments();
  
  const { create, loading: creating, error: createError } = useCreatePayment();
  const { verify, loading: verifying, error: verifyError } = useVerifyPayment();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (courseLoading) return <LoadingState message="Loading course details…" />;
  if (courseError) return <ErrorState message={courseError} />;
  if (!course) return <ErrorState message="Course not found." />;

  const handleSubmit = async (provider: PaymentProvider, phone: string) => {
    setError(null);
    setStatus('pending');
    try {
      // 1. Create payment
      const created = await create({
        course_id: course.id,
        provider,
        phone_number: phone,
      });
      setPayment(created);

      // 2. Verify payment (using the ID from creation)
      const verified = await verify(created.id);
      setStatus(verified.status);
      
      if (verified.status === 'succeeded') {
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