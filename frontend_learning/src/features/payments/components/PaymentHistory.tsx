import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import type { PaymentHistoryItem } from '../types';

interface PaymentHistoryProps {
  payments: PaymentHistoryItem[];
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  if (payments.length === 0) {
    return (
      <div className="rounded-[2rem] border border-surface-container bg-surface-container-lowest p-12 text-center">
        <h3 className="text-xl font-bold text-carbon">No payment records</h3>
        <p className="mt-2 text-on-surface-variant">You have not made any payments yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-l border border-surface-container bg-surface-container-lowest shadow-[0_8px_24px_rgba(18,18,20,0.04)]">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-surface-container bg-surface-container">
          <tr>
            <th className="px-6 py-4 font-bold text-on-surface-variant">Course</th>
            <th className="px-6 py-4 font-bold text-on-surface-variant">Amount</th>
            <th className="px-6 py-4 font-bold text-on-surface-variant">Provider</th>
            <th className="px-6 py-4 font-bold text-on-surface-variant">Date</th>
            <th className="px-6 py-4 font-bold text-on-surface-variant">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container">
          {payments.map((p) => (
            <tr key={p.id} className="transition hover:bg-surface-container/50">
              <td className="px-6 py-4 font-bold text-carbon">{p.course_title || `Course: ${(p.course_id || '').slice(0, 8)}...`}</td>
              <td className="px-6 py-4 font-semibold text-on-surface-variant">{formatCurrency(p.amount_xaf ?? 0, p.currency ?? 'XAF')}</td>
              <td className="px-6 py-4 font-semibold capitalize text-on-surface-variant">{p.provider || 'Unknown'}</td>
              <td className="px-6 py-4 font-semibold text-on-surface-variant">{formatDate(p.created_at)}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${
                  p.status === 'succeeded' ? 'bg-secondary-container text-on-secondary-container' 
                  : p.status === 'failed' ? 'bg-error-container text-on-error-container' 
                  : 'bg-tertiary-container text-on-tertiary-container'
                }`}>
                  {p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : 'Pending'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}