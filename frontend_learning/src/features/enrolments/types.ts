export interface Enrolment {
  id: string;
  student_id: string;
  course_id: string;
  is_active?: boolean; // <-- Make this optional
  enrolled_at: string;
}