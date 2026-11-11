import { client } from '../../../services/api/client';
import type { Payment, PaymentHistoryItem, PaymentInitiatePayload } from '../types';

export const paymentService = {
  createPayment(payload: PaymentInitiatePayload): Promise<Payment> {
    return client.post<Payment>('/payments', payload);
  },

  verifyPayment(paymentId: string): Promise<Payment> {
    return client.post<Payment>(`/payments/${paymentId}/verify`);
  },

  getMyPayments(): Promise<PaymentHistoryItem[]> {
    return client.get<PaymentHistoryItem[]>('/payments/me');
  },
};