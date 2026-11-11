import { useCallback, useState } from 'react';
import { enrolmentService } from '../services/enrolmentService';
import { ApiError } from '../../../services/api/client';
import type { Enrolment } from '../types';

export function useEnrol() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enrol = useCallback(async (courseId: string): Promise<Enrolment> => {
    setLoading(true);
    setError(null);
    try {
      return await enrolmentService.enrolFree(courseId);
    } catch (e) {
      setError(e instanceof ApiError ? e.info.message : 'Enrolment failed.');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { enrol, loading, error };
}