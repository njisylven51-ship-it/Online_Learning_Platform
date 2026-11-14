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
  duration?: number | null;
  position: number;
  is_preview: boolean;
  videos?: { 
    id: string; 
    status: string; 
    format: string; 
    duration_seconds: number; 
  }[];
}

export interface Resource {
  id: string;
  title: string;
  resource_type: string; // <-- Changed from 'type'
  mime_type: string;
  size_bytes: number;
  download_url: string;  // <-- Changed from 'url'
  expires_in_seconds: number;
}

export interface VideoPlaybackInfo {
  video_id: string;
  playback_url: string;      // <-- Changed from 'url'
  expires_in_seconds: number; // <-- Changed from 'expires_in'
  duration_seconds: number;   // <-- Changed from 'duration'
  format: string;
}

export interface CourseProgress {
  course_id: string;
  completed_lessons: number;
  total_lessons: number;
  percentage: number;
}