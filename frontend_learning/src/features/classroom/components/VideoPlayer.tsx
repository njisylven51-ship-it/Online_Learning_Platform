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
  const endedRef = useRef(false);

  // Refetch the signed URL every 4 minutes (they expire after 5)
  useEffect(() => {
    const interval = setInterval(() => refetch(), 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refetch]);

  /**
   * Send a progress update to the backend.
   * Always includes the browser's true duration so the backend can
   * permanently heal videos that Cloudinary failed to process.
   */
  const saveProgress = async (position: number, duration: number) => {
    if (isNaN(duration) || duration <= 0) {
      console.warn('[video] skipping save — invalid duration:', duration);
      return;
    }

    try {
      console.log(
        `[video] saving → position=${position}s duration=${duration.toFixed(2)}s`,
      );
      await classroomService.updateVideoProgress(videoId, position, duration);
      lastSaved.current = position;
    } catch (err: any) {
      console.error(
        '[video] save failed:',
        err?.info?.message || err,
      );
    }
  };

  // When the browser knows the duration, send it to the backend immediately.
  // This "heals" videos whose duration came back as 0 from Cloudinary.
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const duration = videoRef.current.duration;
    if (duration > 0) {
      console.log('[video] metadata loaded, duration:', duration.toFixed(2), 's');
      void saveProgress(0, duration);
    }
  };

  // Fires ~4x/second. Send every time we've advanced at least 10s since the last save.
  // (The old `% 10 === 0` check misses updates due to browser throttling.)
  const handleTimeUpdate = () => {
    if (!videoRef.current || endedRef.current) return;

    const currentTime = Math.floor(videoRef.current.currentTime);
    const duration = videoRef.current.duration;

    if (currentTime - lastSaved.current >= 10) {
      void saveProgress(currentTime, duration);
    }
  };

  // Save on pause too — captures the exact position if the student stops early.
  const handlePause = () => {
    if (!videoRef.current || endedRef.current) return;
    const currentTime = Math.floor(videoRef.current.currentTime);
    const duration = videoRef.current.duration;
    void saveProgress(currentTime, duration);
  };

  const handleEnded = async () => {
    if (endedRef.current) return;
    endedRef.current = true;

    if (videoRef.current) {
      const duration = videoRef.current.duration;
      // Send the FINAL position = full duration to guarantee ≥ 90% watched
      await saveProgress(Math.floor(duration), duration);
    }

    // Trigger lesson completion (markComplete in LessonContent)
    onComplete();
  };

  if (loading) return <LoadingState message="Loading video player…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!playback) return null;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        src={playback.playback_url}
        controls
        className="h-full w-full"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPause={handlePause}
        onEnded={handleEnded}
        controlsList="nodownload"
      >
        <track kind="captions" />
      </video>
    </div>
  );
}