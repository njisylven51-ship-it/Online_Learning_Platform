import { client } from '../../../services/api/client';
import type { Enrolment } from '../types';

export const enrolmentService = {
  enrolFree(courseId: string): Promise<Enrolment> {
    return client.post<Enrolment>(`/enrolments/${courseId}`);
  },
  getMyEnrolments(): Promise<Enrolment[]> {
    return client.get<Enrolment[]>('/enrolments/me');
  },
};