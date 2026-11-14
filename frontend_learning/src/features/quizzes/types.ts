export interface QuizQuestionPayload {
  prompt: string;
  question_type: 'multiple_choice';
  choices: string[];
  correct_answers: string[];
  points: number;
  position: number;
}

export interface QuizCreatePayload {
  title: string;
  description?: string;
  passing_score: number;
  max_attempts: number;
  questions: QuizQuestionPayload[];
}

export interface QuizRead {
  id: string;
  lesson_id: string;
  title: string;
  passing_score: number;
  max_attempts: number;
  published: boolean;
}