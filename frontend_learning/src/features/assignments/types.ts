export interface Assignment {
  id: string;
  lesson_id: string;
  title: string;
  instructions: string;
  due_at: string | null;
  max_score: number;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  text_submission: string | null;  // <-- Changed from 'text'
  file_public_id: string | null;
  score: number | null;
  feedback: string | null;
  status: 'submitted' | 'graded';
  submitted_at: string;
}

export interface AssignmentUploadSignature {
  cloud_name?: string;
  api_key: string;
  timestamp: number;
  signature: string;
  upload_url?: string;
  folder?: string;
  public_id?: string;
  public_id_prefix?: string;
  [key: string]: unknown;
}