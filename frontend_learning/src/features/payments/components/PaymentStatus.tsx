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
      <div className="rounded-xl border border-line bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <h3 className="text-lg font-semibold text-forest">Verifying payment…</h3>
        <p className="mt-1 text-sm text-ink-muted">Please wait while we confirm with the provider.</p>
      </div>
    );
  }

  if (status === 'succeeded') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-2xl text-forest">
          ✓
        </div>
        <h3 className="text-lg font-semibold text-forest">Payment Successful!</h3>
        <p className="mt-1 text-sm text-green-800">
          You are now enrolled in this course.
        </p>
        <Button size="lg" className="mt-6 w-full" onClick={onGoToCourse}>
          Go to Classroom
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600">
        ✗
      </div>
      <h3 className="text-lg font-semibold text-forest">Payment Failed</h3>
      <p className="mt-1 text-sm text-red-700">
        The payment could not be processed. No course access has been granted.
      </p>
      <Button variant="secondary" size="lg" className="mt-6 w-full" onClick={onRetry}>
        Try Again
      </Button>
    </div>
  );
}