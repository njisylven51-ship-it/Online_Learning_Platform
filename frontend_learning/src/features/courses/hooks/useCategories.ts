import { useCallback, useEffect, useState } from 'react';
import { courseService } from '../services/courseService';
import { ApiError } from '../../../services/api/client';
import type { Category } from '../types';

export function useCategories() {
  const [data, setData] = useState<Category[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await courseService.getCategories());
    } catch (e) {
      setError(e instanceof ApiError ? e.info.message : 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}