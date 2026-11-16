import { useEffect, useState } from 'react';
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
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatCurrency';
import type { Payment, PaymentProvider, PaymentStatus } from '../types';

export default function PaymentCheckout() {
  const { courseId = '' } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const { data: course, loading: courseLoading, error: courseError } = useCourseDetails(courseId);
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
              <Button className="rounded-full bg-carbon text-white hover:bg-carbon-light px-8 py-3">Go to Classroom</Button>
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
    // Increased to max-w-7xl to fill the full dashboard width, with extra spacing
    <div className="mx-auto max-w-7xl space-y-8 py-8">
      
      <Link to={`/student/courses/${course.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-on-primary-container transition">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to course
      </Link>

      {/* Two-column layout spanning the whole screen */}
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        
        {/* Left Column: Order Summary & Simulator */}
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-surface-container bg-surface-container-lowest p-10 shadow-[0_8px_24px_rgba(18,18,20,0.04)]">
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Checkout</p>
            <h1 className="mt-2 text-3xl font-extrabold text-carbon">{course.title}</h1>
            <div className="mt-8 flex items-baseline gap-2">
              <p className="text-6xl font-black text-primary">{formatCurrency(course.price_xaf)}</p>
            </div>
          </div>

          <SimulatorBanner />
        </div>

        {/* Right Column: Payment Form or Status */}
        <div className="space-y-6">
          {error && (
            <div className=" border border-error-container bg-error-container/30 p-4 text-sm font-bold text-on-error-container">
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
            <div className="rounded-[1rem] border border-surface-container bg-surface-container-lowest p-10 shadow-[0_8px_24px_rgba(18,18,20,0.04)]">
              <h2 className="mb-8 text-2xl font-extrabold text-carbon">Payment Details</h2>
              <PaymentForm onSubmit={handleSubmit} loading={isProcessing} />
              {createError && <p className="mt-3 text-sm font-bold text-error">{createError}</p>}
              {verifyError && <p className="mt-3 text-sm font-bold text-error">{verifyError}</p>}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}