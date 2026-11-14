import { useCallback, useEffect, useState } from 'react';
import { courseService } from '../../courses/services/courseService';
import { ApiError } from '../../../services/api/client';
import type { Course } from '../../courses/types';

export function useMyCourses() {
  const [data, setData] = useState<Course[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await courseService.getMyCourses());
    } catch (e) {
      setError(e instanceof ApiError ? e.info.message : 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}