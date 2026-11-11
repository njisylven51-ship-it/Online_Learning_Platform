import { useEffect, useRef } from 'react';
import { useVideoPlayback } from '../hooks/useVideoPlayback';
import { classroomService } from '../services/classroomService';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';

interface VideoPlayerProps {
  videoId: string;
  onComplete: () => void;
}

export function VideoPlayer({ videoId, onComplete }: VideoPlayerProps) {
  const { playback, loading, error, refetch } = useVideoPlayback(videoId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSaved = useRef<number>(0);

  // Refetch URL every 4 minutes to prevent expiration (URLs live for 5 min)
  useEffect(() => {
    const interval = setInterval(() => refetch(), 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const currentTime = Math.floor(videoRef.current.currentTime);

    // Save progress every 10 seconds
    if (currentTime > 0 && currentTime % 10 === 0 && currentTime !== lastSaved.current) {
      lastSaved.current = currentTime;
      classroomService.updateVideoProgress(videoId, currentTime).catch(() => {
        /* non-critical background failure */
      });
    }
  };

  if (loading) return <LoadingState message="Loading video player…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!playback) return null;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        src={playback.url}
        controls
        className="h-full w-full"
        onTimeUpdate={handleTimeUpdate}
        onEnded={onComplete}
        controlsList="nodownload"
      >
        <track kind="captions" />
      </video>
    </div>
  );
}