export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  position: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  youtube_url?: string | null;
  video_id?: string | null; // Optional: links to the Video model
  duration?: number | null;
  position: number;
  is_preview: boolean;
}

export interface Resource {
  id: string;
  lesson_id: string;
  title: string;
  type: 'image' | 'document' | string;
  url: string;
}

export interface VideoPlaybackInfo {
  video_id: string;
  url: string;
  expires_in: number;
  duration: number;
  format: string;
}

export interface CourseProgress {
  course_id: string;
  completed_lessons: number;
  total_lessons: number;
  percentage: number;
}