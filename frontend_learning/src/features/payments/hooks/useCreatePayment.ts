import { useCallback, useState } from 'react';
import { paymentService } from '../services/paymentService';
import { ApiError } from '../../../services/api/client';
import type { Payment, PaymentInitiatePayload } from '../types';

export function useCreatePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (payload: PaymentInitiatePayload): Promise<Payment> => {
    setLoading(true);
    setError(null);
    try {
      return await paymentService.createPayment(payload);
    } catch (e) {
      setError(e instanceof ApiError ? e.info.message : 'Failed to create payment.');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
}