import { Button } from '../../../components/ui/Button';
import type { PaymentStatus } from '../types';

interface PaymentStatusProps {
  status: PaymentStatus;
  onRetry: () => void;
  onGoToCourse: () => void;
}

export function PaymentStatusDisplay({ status, onRetry, onGoToCourse }: PaymentStatusProps) {
  if (status === 'pending') {
    return (
      <div className="rounded-[2rem] border border-surface-container bg-surface-container-lowest p-10 text-center shadow-[0_8px_24px_rgba(18,18,20,0.04)]">
        <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <h3 className="text-xl font-extrabold text-carbon">Verifying payment…</h3>
        <p className="mt-2 text-sm font-medium text-on-surface-variant">Please wait while we confirm with the provider.</p>
      </div>
    );
  }

  if (status === 'succeeded') {
    return (
      <div className="rounded-[2rem] bg-secondary-container p-10 text-center shadow-[0_12px_30px_rgba(184,236,199,0.45)]">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/50 text-2xl text-on-secondary-container">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" /></svg>
        </div>
        <h3 className="text-2xl font-extrabold text-on-secondary-container">Payment Successful!</h3>
        <p className="mt-2 text-sm font-medium text-on-secondary-container/80">
          You are now enrolled in this course.
        </p>
        <Button 
          className="mt-8 w-full rounded-full bg-carbon py-4 text-base font-extrabold text-white hover:bg-carbon-light" 
          onClick={onGoToCourse}
        >
          Go to Classroom
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-error-container bg-error-container/30 p-10 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-error-container text-on-error-container">
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </div>
      <h3 className="text-2xl font-extrabold text-on-error-container">Payment Failed</h3>
      <p className="mt-2 text-sm font-medium text-on-error-container/80">
        The payment could not be processed. No course access has been granted.
      </p>
      <Button 
        className="mt-8 w-full rounded-full bg-carbon py-4 text-base font-extrabold text-white hover:bg-carbon-light" 
        onClick={onRetry}
      >
        Try Again
      </Button>
    </div>
  );
}