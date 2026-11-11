import { useCallback, useEffect, useState } from 'react';
import { certificateService } from '../services/certificateService';
import { ApiError } from '../../../services/api/client';
import type { Certificate } from '../types';

export function useCertificates() {
  const [data, setData] = useState<Certificate[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await certificateService.getMyCertificates());
    } catch (e) {
      // If it 404s, it might mean the endpoint isn't implemented yet, 
      // but let's handle it gracefully.
      if (e instanceof ApiError && e.info.status === 404) {
        setData([]);
      } else {
        setError(e instanceof ApiError ? e.info.message : 'Failed to load certificates.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const generate = useCallback(async (courseId: string) => {
    setGenerating(courseId);
    try {
      await certificateService.generateCertificate(courseId);
      await fetch(); // Re-fetch the list
    } catch (e) {
      console.error('Failed to generate certificate', e);
    } finally {
      setGenerating(null);
    }
  }, [fetch]);

  useEffect(() => { void fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch, generate, generating };
}