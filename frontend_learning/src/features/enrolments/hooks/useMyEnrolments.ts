import { useCallback, useEffect, useState } from 'react';
import { enrolmentService } from '../services/enrolmentService';
import { useAuth } from '../../../contexts/AuthContext';
import { ApiError } from '../../../services/api/client';
import type { Enrolment } from '../types';

export function useMyEnrolments() {
  const { user } = useAuth();
  const [data, setData] = useState<Enrolment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user || user.role !== 'student') {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(await enrolmentService.getMyEnrolments());
    } catch (e) {
      setError(e instanceof ApiError ? e.info.message : 'Failed to load enrolments.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}