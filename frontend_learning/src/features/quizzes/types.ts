export interface QuizQuestionPayload {
  prompt: string;
  question_type: 'multiple_choice';
  choices: string[];
  correct_answers: string[];
  points: number;
  position: number;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  question_type: string;
  choices: string[];
  points: number;
  position: number;
  // NOTE: correct_answers is NOT returned to students
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  passing_score: number;
  max_attempts: number;
  published: boolean;
  questions?: QuizQuestion[];
}

export interface QuizAttemptResult {
  id: string;
  score: number;
  passed: boolean;
  submitted_at: string;
}

export interface QuizCreatePayload {
  title: string;
  passing_score: number;
  max_attempts: number;
  questions: {
    prompt: string;
    question_type: 'multiple_choice';
    choices: string[];
    correct_answers: string[];
    points: number;
    position: number;
  }[];
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

