import { useCallback, useEffect, useState } from 'react';
import { classroomService } from '../services/classroomService';
import { ApiError } from '../../../services/api/client';
import type { VideoPlaybackInfo } from '../types';

export function useVideoPlayback(videoId: string | undefined | null) {
  const [playback, setPlayback] = useState<VideoPlaybackInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!videoId) return;
    setLoading(true);
    setError(null);
    try {
      setPlayback(await classroomService.getVideoPlayback(videoId));
    } catch (e) {
      setError(e instanceof ApiError ? e.info.message : 'Failed to load video.');
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => { void fetch(); }, [fetch]);

  return { playback, loading, error, refetch: fetch };
}