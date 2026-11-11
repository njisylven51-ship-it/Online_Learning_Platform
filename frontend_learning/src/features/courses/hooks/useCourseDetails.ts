import { useCallback, useEffect, useState } from 'react';
import { courseService } from '../services/courseService';
import { ApiError } from '../../../services/api/client';
import type { Course } from '../types';

export function useCourseDetails(courseId: string) {
  const [data, setData] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      setData(await courseService.getCourse(courseId));
    } catch (e) {
      setData(null);
      setError(e instanceof ApiError ? e.info.message : 'Failed to load course.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { void fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}