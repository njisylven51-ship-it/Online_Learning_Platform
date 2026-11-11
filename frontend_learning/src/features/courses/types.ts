export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Course {
  id: string;
  instructor_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string;
  level: string;
  price_xaf: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
}

export interface InstructorProfile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string;
  qualifications: string;
  status: string;
}

export interface CourseQuery {
  q?: string;
  categoryId?: string;
  limit?: number;
  offset?: number;
}