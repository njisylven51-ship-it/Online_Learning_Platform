import { client } from '../../../services/api/client';
import type {
  Assignment,
  AssignmentUploadSignature,
  Submission,
} from '../types';

export const assignmentService = {
  getForLesson(lessonId: string): Promise<Assignment[]> {
    return client.get<Assignment[]>(`/assignments/lessons/${lessonId}`);
  },

  getUploadSignature(): Promise<AssignmentUploadSignature> {
    return client.post<AssignmentUploadSignature>('/assignments/upload-signature', {});
  },

  submit(
    assignmentId: string,
    text: string | null,
    filePublicId: string | null,
  ): Promise<Submission> {
    const payload: { text_submission?: string; file_public_id?: string } = {};
    
    // <-- Changed key from 'text' to 'text_submission'
    if (text && text.trim()) payload.text_submission = text.trim();
    
    if (filePublicId) payload.file_public_id = filePublicId;

    if (!payload.text_submission && !payload.file_public_id) {
      throw new Error('BUG: empty submission payload.');
    }

    return client.post<Submission>(
      `/assignments/${assignmentId}/submissions`,
      payload,
    );
  },

  getMySubmissions(): Promise<Submission[]> {
    return client.get<Submission[]>('/assignments/me/submissions');
  },
};