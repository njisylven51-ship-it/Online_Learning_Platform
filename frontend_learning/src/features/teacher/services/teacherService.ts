import { client } from '../../../services/api/client';

export interface TeacherStats {
  total_courses: number;
  total_students: number;
  pending_reviews: number;
}

export interface StudentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  text: string | null;
  file_public_id: string | null;
  score: number | null;
  feedback: string | null;
  status: 'submitted' | 'graded';
  submitted_at: string;
  assignment_title?: string;
  student_name?: string;
}

export const teacherService = {
  getDashboardStats(): Promise<TeacherStats> {
    return client.get<TeacherStats>('/teacher/dashboard');
  },

  getSubmissions(): Promise<StudentSubmission[]> {
    return client.get<StudentSubmission[]>('/assignments/submissions/mine');
  },

  gradeSubmission(submissionId: string, score: number, feedback: string): Promise<any> {
    return client.post<any>(`/assignments/submissions/${submissionId}/grade`, {
      score,
      feedback,
    });
  },
};