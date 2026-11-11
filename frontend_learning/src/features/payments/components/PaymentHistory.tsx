import { Badge } from '../../../components/ui/Badge';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { EmptyState } from '../../../components/feedback/EmptyState';
import type { PaymentHistoryItem } from '../types';

interface PaymentHistoryProps {
  payments: PaymentHistoryItem[];
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  if (payments.length === 0) {
    return <EmptyState title="No payment records" description="You have not made any payments yet." />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line bg-forest-tint">
          <tr>
            <th className="px-4 py-3 font-medium text-forest">Course</th>
            <th className="px-4 py-3 font-medium text-forest">Amount</th>
            <th className="px-4 py-3 font-medium text-forest">Provider</th>
            <th className="px-4 py-3 font-medium text-forest">Date</th>
            <th className="px-4 py-3 font-medium text-forest">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {payments.map((p) => (
            <tr key={p.id} className="hover:bg-forest-tint/50">
              <td className="px-4 py-3 font-medium text-forest">
                {p.course_title ?? '—'}
              </td>
              <td className="px-4 py-3">{formatCurrency(p.amount_xaf, p.currency)}</td>
              <td className="px-4 py-3 capitalize">{p.provider}</td>
              <td className="px-4 py-3 text-ink-muted">{formatDate(p.created_at)}</td>
              <td className="px-4 py-3">
                <Badge
                  tone={
                    p.status === 'succeeded' ? 'success' : p.status === 'failed' ? 'danger' : 'warning'
                  }
                >
                  {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}