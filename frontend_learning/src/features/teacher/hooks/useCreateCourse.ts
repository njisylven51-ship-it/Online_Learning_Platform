import { useCallback, useState } from 'react';
import { courseService } from '../../courses/services/courseService';
import { ApiError } from '../../../services/api/client';
import type { Course, CourseCreatePayload } from '../../courses/types';

export function useCreateCourse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (payload: CourseCreatePayload): Promise<Course> => {
    setLoading(true);
    setError(null);
    try {
      return await courseService.createCourse(payload);
    } catch (e) {
      setError(e instanceof ApiError ? e.info.message : 'Failed to create course.');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
}