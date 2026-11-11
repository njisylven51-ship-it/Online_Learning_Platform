import { PageHeader } from '../../../components/common/PageHeader';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { usePaymentHistory } from '../hooks/usePaymentHistory';
import { PaymentHistory as PaymentHistoryList } from '../components/PaymentHistory';

export default function PaymentHistoryPage() {
  const { data, loading, error, refetch } = usePaymentHistory();

  if (loading) return <LoadingState message="Loading payment history…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment History"
        subtitle="View your recent transactions and enrollment fees."
      />
      <PaymentHistoryList payments={data ?? []} />
    </div>
  );
}