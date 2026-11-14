import { client } from '../../../services/api/client';
import type { QuizCreatePayload, QuizRead } from '../types';

export const quizService = {
  createQuiz(lessonId: string, payload: QuizCreatePayload): Promise<QuizRead> {
    return client.post<QuizRead>(`/quizzes/lessons/${lessonId}`, payload);
  },

  getQuizzesForLesson(lessonId: string): Promise<QuizRead[]> {
    return client.get<QuizRead[]>(`/quizzes/lessons/${lessonId}`);
  },

  publishQuiz(quizId: string): Promise<QuizRead> {
    return client.post<QuizRead>(`/quizzes/${quizId}/publish`);
  },
};