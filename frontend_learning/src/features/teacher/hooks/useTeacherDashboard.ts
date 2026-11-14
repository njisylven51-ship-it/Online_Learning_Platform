import { useCallback, useEffect, useState } from 'react';
import { teacherService, type TeacherStats } from '../services/teacherService';
import { ApiError } from '../../../services/api/client';

export function useTeacherDashboard() {
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teacherService.getDashboardStats();
      setStats(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.info.message : 'Failed to load dashboard stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { stats, loading, error, refetch: fetch };
}