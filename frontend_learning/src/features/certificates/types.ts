export interface Certificate {
  id: string;
  student_id: string;
  course_id: string;
  certificate_code: string;
  issued_at: string;
  revoked: boolean;
  pdf_url?: string | null;
  course_title?: string; // Might be returned by backend
}