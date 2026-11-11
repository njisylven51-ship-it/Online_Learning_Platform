import { useCallback, useState } from 'react';
import { paymentService } from '../services/paymentService';
import { ApiError } from '../../../services/api/client';
import type { Payment } from '../types';

export function useVerifyPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = useCallback(async (paymentId: string): Promise<Payment> => {
    setLoading(true);
    setError(null);
    try {
      return await paymentService.verifyPayment(paymentId);
    } catch (e) {
      setError(e instanceof ApiError ? e.info.message : 'Failed to verify payment.');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { verify, loading, error };
}