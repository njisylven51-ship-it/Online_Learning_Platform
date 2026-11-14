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

// Add this to the existing file
export interface CourseCreatePayload {
  title: string;
  slug: string; // <-- MUST BE HERE
  description: string;
  category_id: string | null;
  level: string;
  price_xaf: number;
}
// Add these to the existing file

export interface LessonCreatePayload {
  title: string;
  content: string;
  position: number;
  youtube_url?: string | null;
  is_preview?: boolean;
}

export interface ModuleCreatePayload {
  title: string;
  description: string;
  position: number;
}

export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder?: string;
  public_id?: string;
  upload_preset?: string;
}
// Add these to the existing file

export interface AssignmentCreatePayload {
  title: string;
  instructions: string;
  due_at?: string | null;
  max_score: number;
}

// Add or update these in your existing types.ts

export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  upload_url: string;
  folder?: string;
  public_id?: string;
  public_id_prefix?: string;
  upload_preset?: string;
}

export interface Resource {
  id: string;
  lesson_id: string;
  title: string;
  type: string;
  url: string;
}

export interface ResourceConfirmPayload {
  lesson_id: string;
  title: string;
  public_id: string;
  resource_type: 'image' | 'document'; // Added 'raw'
}



