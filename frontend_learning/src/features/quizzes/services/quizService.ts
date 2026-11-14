import { client } from '../../../services/api/client';
import type { Quiz, QuizAttemptResult, QuizCreatePayload } from '../types';

export const quizService = {
  createQuiz(lessonId: string, payload: QuizCreatePayload): Promise<Quiz> {
    return client.post<Quiz>(`/quizzes/lessons/${lessonId}`, payload);
  },

  getQuizzesForLesson(lessonId: string): Promise<Quiz[]> {
    return client.get<Quiz[]>(`/quizzes/lessons/${lessonId}`);
  },

  getQuiz(quizId: string): Promise<Quiz> {
    return client.get<Quiz>(`/quizzes/${quizId}`);
  },

  submitAttempt(
    quizId: string,
    answers: Record<string, string[]>,
  ): Promise<QuizAttemptResult> {
    return client.post<QuizAttemptResult>(`/quizzes/${quizId}/attempts`, { answers });
  },

  publishQuiz(quizId: string): Promise<Quiz> {
    return client.post<Quiz>(`/quizzes/${quizId}/publish`);
  },
};