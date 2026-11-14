import { client } from '../../../services/api/client';
import type { Certificate } from '../types';

export const certificateService = {
  getMyCertificates(): Promise<Certificate[]> {
    // This now hits the new backend route
    return client.get<Certificate[]>('/certificates/me');
  },
  
  generateCertificate(courseId: string): Promise<Certificate> {
    return client.post<Certificate>(`/certificates/courses/${courseId}`);
  },
  
  getPdfUrl(certificateId: string): string {
    // The frontend uses a Blob fetch for this, so it just needs the base URL
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/certificates/${certificateId}/pdf`;
  }
};