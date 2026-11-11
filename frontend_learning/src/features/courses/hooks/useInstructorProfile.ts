import { useEffect, useState } from 'react';
import { courseService } from '../services/courseService';
import { ApiError } from '../../../services/api/client';
import type { InstructorProfile } from '../types';

export function useInstructorProfile(userId: string) {
  const [data, setData] = useState<InstructorProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    courseService
      .getInstructorProfile(userId)
      .then((p) => { if (!cancelled) setData(p); })
      .catch((e) => {
        if (!cancelled) {
          setData(null);
          if (!(e instanceof ApiError)) console.error(e);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  return { data, loading };
}