import { useCallback, useEffect, useState } from 'react';
import { paymentService } from '../services/paymentService';
import { ApiError } from '../../../services/api/client';
import type { PaymentHistoryItem } from '../types';

export function usePaymentHistory() {
  const [data, setData] = useState<PaymentHistoryItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await paymentService.getMyPayments());
    } catch (e) {
      setError(e instanceof ApiError ? e.info.message : 'Failed to load payment history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}