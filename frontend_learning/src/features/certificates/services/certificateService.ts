import { client } from '../../../services/api/client';
import type { Certificate } from '../types';

export const certificateService = {
  getMyCertificates(): Promise<Certificate[]> {
    return client.get<Certificate[]>('/certificates/me');
  },
  
  generateCertificate(courseId: string): Promise<Certificate> {
    return client.post<Certificate>(`/certificates/courses/${courseId}`);
  },
  
  getPdfUrl(certificateId: string): string {
    // We return the URL string so the browser can open it in a new tab
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/certificates/${certificateId}/pdf`;
  }
};