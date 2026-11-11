import { useCallback, useEffect, useState } from 'react';
import { classroomService } from '../services/classroomService';
import { ApiError } from '../../../services/api/client';
import type { Module, Lesson, CourseProgress } from '../types';

export interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

export function useCourseContent(courseId: string) {
  const [modules, setModules] = useState<ModuleWithLessons[] | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch modules
      const rawModules = await classroomService.getModules(courseId);
      
      // 2. Fetch lessons for each module
      const modulesWithLessons = await Promise.all(
        rawModules.map(async (m) => {
          const lessons = await classroomService.getLessons(m.id);
          return { ...m, lessons };
        }),
      );
      
      // 3. Sort by position
      modulesWithLessons.sort((a, b) => a.position - b.position);
      modulesWithLessons.forEach((m) => m.lessons.sort((a, b) => a.position - b.position));
      
      setModules(modulesWithLessons);

      // 4. Fetch overall progress
      const prog = await classroomService.getCourseProgress(courseId);
      setProgress(prog);
    } catch (e) {
      setError(e instanceof ApiError ? e.info.message : 'Failed to load course content.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { void fetch(); }, [fetch]);

  return { modules, progress, loading, error, refetch: fetch };
}