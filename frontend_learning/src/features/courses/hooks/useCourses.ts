import { useCallback, useEffect, useState } from 'react';
import { courseService } from '../services/courseService';
import { ApiError } from '../../../services/api/client';
import type { Course, CourseQuery } from '../types';

export function useCourses(query: CourseQuery) {
  const [data, setData] = useState<Course[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { q, categoryId, limit = 20, offset = 0 } = query;

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await courseService.getCourses({ q, categoryId, limit, offset });
      setData(result);
    } catch (e) {
      setData(null);
      setError(e instanceof ApiError ? e.info.message : 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  }, [q, categoryId, limit, offset]);

  useEffect(() => { void fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}