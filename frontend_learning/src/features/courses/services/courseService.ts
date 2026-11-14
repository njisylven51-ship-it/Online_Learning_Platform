import { client } from '../../../services/api/client';
import { session } from '../../../services/storage/session';
import { env } from '../../../config/env';
import type {
  Category,
  CloudinarySignature,
  Course,
  CourseCreatePayload,
  CourseQuery,
  AssignmentCreatePayload,
  InstructorProfile,
  LessonCreatePayload,
  ResourceConfirmPayload,
} from '../types';

export const courseService = {
  // --- Public Course Browse ---
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

  // --- Teacher Course Management ---
  createCourse(payload: CourseCreatePayload): Promise<Course> {
    return client.post<Course>('/courses', payload);
  },

  getMyCourses(): Promise<Course[]> {
    return client.get<Course[]>('/courses/mine');
  },

  submitForReview(courseId: string): Promise<Course> {
    return client.post<Course>(`/courses/${courseId}/submit`);
  },

  // --- Modules ---
  getModules(courseId: string): Promise<any[]> {
    return client.get<any[]>(`/courses/${courseId}/modules`);
  },

  createModule(
    courseId: string, 
    payload: { title: string; description: string; position: number }
  ): Promise<any> {
    return client.post<any>(`/courses/${courseId}/modules`, payload);
  },

  // --- Lessons ---
  getLessons(moduleId: string): Promise<any[]> {
    return client.get<any[]>(`/modules/${moduleId}/lessons`);
  },

  createLesson(moduleId: string, payload: LessonCreatePayload): Promise<any> {
    return client.post<any>(`/modules/${moduleId}/lessons`, payload);
  },

  // --- Video Upload Flow (Cloudinary) ---
  getVideoUploadSignature(lessonId: string): Promise<CloudinarySignature> {
    return client.post<CloudinarySignature>('/videos/upload-signature', { lesson_id: lessonId });
  },

  confirmVideoUpload(lessonId: string, publicId: string): Promise<any> {
    return client.post<any>('/videos/confirm', { lesson_id: lessonId, public_id: publicId });
  },

  // --- Assignments ---
  createAssignment(lessonId: string, payload: AssignmentCreatePayload): Promise<any> {
    return client.post<any>(`/assignments/lessons/${lessonId}`, payload);
  },

  // --- Resources (PDFs/Images) ---
  getResourceSignature(kind: 'document' | 'image'): Promise<CloudinarySignature> {
    return client.post<CloudinarySignature>(`/resources/upload-signature?kind=${kind}`);
  },

  confirmResource(payload: ResourceConfirmPayload): Promise<any> {
    // Direct fetch to guarantee the Content-Type header is application/json
    const token = session.getToken();
    return fetch(`${env.apiBaseUrl}/resources/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Confirm resource error:', errorData);
        throw new Error('Failed to confirm resource');
      }
      return res.json();
    });
  },
};