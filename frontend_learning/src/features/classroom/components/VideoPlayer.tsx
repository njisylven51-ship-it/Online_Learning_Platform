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

  // Refetch URL every 4 minutes to prevent expiration (URLs live for 5 min)
  useEffect(() => {
    const interval = setInterval(() => refetch(), 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Core function to extract duration and send progress to backend
  const saveProgress = async (isEnded = false) => {
    if (!videoRef.current) return;
    
    const currentTime = Math.floor(videoRef.current.currentTime);
    const totalDuration = videoRef.current.duration;

    // Wait until browser has loaded metadata (duration is a valid number)
    if (isNaN(totalDuration) || totalDuration === 0) return;

    try {
      await classroomService.updateVideoProgress(
        videoId, 
        isEnded ? Math.floor(totalDuration) : currentTime, 
        totalDuration // <-- Sending the fallback duration!
      );
      lastSaved.current = currentTime;
    } catch (err) {
      // Silently catch 409s in case of transient state
      console.warn('Failed to save video progress', err);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || endedRef.current) return;
    
    const currentTime = Math.floor(videoRef.current.currentTime);

    // Auto-save every 10 seconds
    if (
      currentTime > 0 && 
      currentTime % 10 === 0 && 
      currentTime !== lastSaved.current
    ) {
      void saveProgress();
    }
  };

  const handleEnded = async () => {
    if (endedRef.current) return;
    endedRef.current = true;
    
    // Save the final progress (100% watched)
    await saveProgress(true);
    
    // Trigger the completion callback (markComplete in LessonContent)
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
        onTimeUpdate={handleTimeUpdate}
        onPause={() => void saveProgress()}  // <-- Save duration if they pause early
        onEnded={handleEnded}
        controlsList="nodownload"
      >
        <track kind="captions" />
      </video>
    </div>
  );
}