export type UserRole = 'student' | 'teacher' | 'administrator';
export type InstructorStatus = 'pending' | 'approved' | 'rejected';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  instructor_status?: InstructorStatus;
  instructor_review_reason?: string;
}