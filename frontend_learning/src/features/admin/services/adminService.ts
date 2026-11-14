import { client } from '../../../services/api/client';
import type { Course, Category } from '../../courses/types';
import type { AuthUser } from '../../../types/user';

export interface AdminStats {
  total_users: number;
  total_courses: number;
  pending_teacher_applications: number;
  pending_course_reviews: number;
}

export interface InstructorApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  bio: string;
  qualifications: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const adminService = {
  // Dashboard
  getDashboardStats(): Promise<AdminStats> {
    return client.get<AdminStats>('/admin/dashboard');
  },

  // User Management
  getUsers(): Promise<AuthUser[]> {
    return client.get<AuthUser[]>('/admin/users');
  },
  toggleUserStatus(userId: string, active: boolean): Promise<AuthUser> {
    return client.patch<AuthUser>(`/admin/users/${userId}/status?active=${active}`, {});
  },

  // Instructor Applications
  getInstructorApplications(): Promise<InstructorApplication[]> {
    return client.get<InstructorApplication[]>('/instructors/applications');
  },
  reviewInstructor(appId: string, approved: boolean, reason?: string): Promise<any> {
    const query = reason ? `?approved=${approved}&reason=${encodeURIComponent(reason)}` : `?approved=${approved}`;
    return client.post<any>(`/instructors/applications/${appId}/review${query}`, {});
  },

  // Course Moderation
  getPendingCourses(): Promise<Course[]> {
    return client.get<Course[]>('/admin/courses?status_filter=pending_review');
  },
  reviewCourse(courseId: string, approved: boolean, reason?: string): Promise<Course> {
    const query = reason ? `?approved=${approved}&reason=${encodeURIComponent(reason)}` : `?approved=${approved}`;
    return client.post<Course>(`/courses/${courseId}/review${query}`, {});
  },

  // Categories
  createCategory(name: string, description: string): Promise<Category> {
    return client.post<Category>('/admin/categories', { name, description, is_active: true });
  }
};