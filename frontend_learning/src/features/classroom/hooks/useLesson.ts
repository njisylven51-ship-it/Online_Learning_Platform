import { useCallback, useEffect, useState } from 'react';
import { classroomService } from '../services/classroomService';
import { ApiError } from '../../../services/api/client';
import type { Lesson, Resource } from '../types';

export function useLesson(lessonId: string | null) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!lessonId) return;
    setLoading(true);
    setError(null);
    try {
      const l = await classroomService.getLesson(lessonId);
      setLesson(l);

      // Backend might 404 if no resources exist, so catch gracefully
      try {
        const res = await classroomService.getResources(lessonId);
        setResources(res);
      } catch {
        setResources([]);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.info.message : 'Failed to load lesson.');
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => { void fetch(); }, [fetch]);

  return { lesson, resources, loading, error, refetch: fetch };
}