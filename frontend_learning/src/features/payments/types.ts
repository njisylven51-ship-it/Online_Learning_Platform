export type PaymentProvider = 'mtn' | 'orange';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed';

export interface PaymentInitiatePayload {
  course_id: string;
  provider: PaymentProvider;
  phone_number: string;
}

export interface Payment {
  id: string;
  student_id: string;
  course_id: string;
  provider_reference: string;
  provider: PaymentProvider;
  amount_xaf: number;
  currency: string;
  status: PaymentStatus;
  is_simulated: boolean;
  created_at: string;
}

export interface PaymentHistoryItem extends Payment {
  course_title?: string;
}