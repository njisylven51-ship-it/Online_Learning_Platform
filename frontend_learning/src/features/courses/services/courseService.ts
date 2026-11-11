import { client } from '../../../services/api/client';
import type { Category, Course, CourseQuery, InstructorProfile } from '../types';

export const courseService = {
  getCourses(query: CourseQuery = {}): Promise<Course[]> {
    const params = new URLSearchParams();
    if (query.q) params.set('q', query.q);
    if (query.categoryId) params.set('category_id', query.categoryId);
    params.set('limit', String(query.limit ?? 20));
    params.set('offset', String(query.offset ?? 0));
    return client.get<Course[]>(`/courses?${params.toString()}`, {
      anonymous: true,
    });
  },

  getCourse(courseId: string): Promise<Course> {
    return client.get<Course>(`/courses/${courseId}`, { anonymous: true });
  },

  getCategories(): Promise<Category[]> {
    return client.get<Category[]>('/courses/categories', { anonymous: true });
  },

  getInstructorProfile(userId: string): Promise<InstructorProfile> {
    return client.get<InstructorProfile>(`/instructors/${userId}/profile`, {
      anonymous: true,
    });
  },
};