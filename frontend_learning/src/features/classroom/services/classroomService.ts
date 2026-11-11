import { client } from '../../../services/api/client';
import type {
  Module,
  Lesson,
  Resource,
  VideoPlaybackInfo,
  CourseProgress,
} from '../types';

export const classroomService = {
  getModules(courseId: string): Promise<Module[]> {
    return client.get<Module[]>(`/courses/${courseId}/modules`);
  },

  getLessons(moduleId: string): Promise<Lesson[]> {
    return client.get<Lesson[]>(`/modules/${moduleId}/lessons`);
  },

  getLesson(lessonId: string): Promise<Lesson> {
    return client.get<Lesson>(`/lessons/${lessonId}`);
  },

  getResources(lessonId: string): Promise<Resource[]> {
    return client.get<Resource[]>(`/resources/lessons/${lessonId}`);
  },

  getVideoPlayback(videoId: string): Promise<VideoPlaybackInfo> {
    return client.get<VideoPlaybackInfo>(`/videos/${videoId}/playback`);
  },

  updateLessonProgress(
    lessonId: string,
    completed: boolean,
    lastPositionSeconds = 0,
  ): Promise<void> {
    return client.put<void>(`/progress/lessons/${lessonId}`, {
      completed,
      last_position_seconds: lastPositionSeconds,
    });
  },

  updateVideoProgress(videoId: string, positionSeconds: number): Promise<void> {
    return client.put<void>(`/videos/${videoId}/progress`, {
      position_seconds: positionSeconds,
    });
  },

  getCourseProgress(courseId: string): Promise<CourseProgress> {
    return client.get<CourseProgress>(`/progress/courses/${courseId}`);
  },
};