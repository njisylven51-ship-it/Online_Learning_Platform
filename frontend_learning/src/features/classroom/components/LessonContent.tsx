import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { VideoPlayer } from './VideoPlayer';
import { classroomService } from '../services/classroomService';
import { AssignmentSection } from '../../assignments/components/AssignmentSection';
import { QuizSection } from '../../quizzes/components/QuizSection';
import type { Lesson, Resource } from '../types';

interface LessonContentProps {
  lesson: Lesson;
  resources: Resource[];
  onCompleted: () => void;
  onRefreshResources?: () => Promise<void>;
}

type MediaItem =
  | { kind: 'video'; id: string; label: string; isReady: boolean }
  | { kind: 'youtube'; url: string; label: string; isReady: boolean };

/** Extract a YouTube video ID from any common URL shape. Returns null if it can't. */
function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?.*[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // raw ID
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

export function LessonContent({ lesson, resources, onCompleted, onRefreshResources }: LessonContentProps) {
  const [completing, setCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Include both ready and processing videos in the tabs
  const allVideos = lesson.videos ?? [];
  
  const mediaItems: MediaItem[] = [
    ...allVideos.map((v, i) => ({
      kind: 'video' as const,
      id: v.id,
      label: allVideos.length > 1 ? `Video ${i + 1}` : 'Video',
      isReady: v.status === 'ready', 
    })),
    ...(lesson.youtube_url
      ? [{ kind: 'youtube' as const, url: lesson.youtube_url, label: 'YouTube', isReady: true }]
      : []),
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = mediaItems[selectedIndex];

  // Only auto-complete if there is exactly 1 Cloudinary video, or if it's text-only/youtube
  const readyVideos = allVideos.filter(v => v.status === 'ready');
  const shouldAutoComplete = readyVideos.length <= 1;

  async function markComplete() {
    setCompleting(true);
    setError(null);
    try {
      await classroomService.updateLessonProgress(lesson.id, true, 0);
      setIsCompleted(true);
      onCompleted();
    } catch (e: any) {
      if (e?.info?.kind === 'conflict' || e?.info?.status === 409) {
        setError(
          'You must complete all required activities (watch videos, pass quizzes, submit assignments) before marking this lesson as complete.',
        );
      } else {
        setError(e?.info?.message || 'Failed to mark lesson as complete.');
      }
    } finally {
      setCompleting(false);
    }
  }

  async function handleDownload(resource: Resource) {
    if (!resource.download_url) {
      alert('Download URL is missing. Please refresh the page.');
      return;
    }

    setDownloading(resource.id);
    try {
      if (onRefreshResources) {
        await onRefreshResources();
      }

      const res = await fetch(resource.download_url);
      if (!res.ok) throw new Error(`Failed to fetch file (${res.status})`);

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = resource.title.toLowerCase().endsWith('.pdf')
        ? resource.title
        : `${resource.title}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      window.open(resource.download_url, '_blank');
    } finally {
      setDownloading(null);
    }
  }

  const pdfs = resources.filter(r =>
    r.resource_type === 'document' || r.mime_type === 'application/pdf'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-forest">{lesson.title}</h1>
        
        {mediaItems.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {mediaItems.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedIndex(i)}
                className={[
                  'rounded-lg px-4 py-1.5 text-sm font-medium transition',
                  selectedIndex === i
                    ? 'bg-accent text-forest shadow-sm'
                    : 'bg-forest-tint text-forest hover:bg-forest-tint-strong',
                  !item.isReady && 'opacity-60'
                ].join(' ')}
              >
                {item.label} {!item.isReady && '(Processing)'}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4">
          {/* 1. If selected is video AND not ready -> Show spinner */}
          {selected?.kind === 'video' && !selected.isReady && (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-line bg-forest-tint text-forest">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="text-sm font-medium">Video is still processing...</p>
              <p className="mt-1 text-xs text-ink-muted">Cloudinary is finalizing the video. Please check back in a few minutes.</p>
            </div>
          )}

          {/* 2. If selected is video AND ready -> Show player */}
          {selected?.kind === 'video' && selected.isReady && (
            <VideoPlayer 
              videoId={selected.id} 
              onComplete={shouldAutoComplete ? markComplete : () => {}} 
            />
          )}

          {/* 3. If selected is YouTube */}
          {selected?.kind === 'youtube' && (() => {
            const ytId = extractYouTubeId(selected.url);
            return ytId ? (
              <div className="space-y-2">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                    title={lesson.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <p className="text-xs text-ink-muted">
                  Can&apos;t play here?{' '}
                  <a
                    href={`https://www.youtube.com/watch?v=${ytId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-accent hover:underline"
                  >
                    Watch on YouTube ↗
                  </a>
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                The YouTube link is invalid. Ask your instructor to check the URL.
              </div>
            );
          })()}

          {/* 4. No media at all */}
          {!selected && (
            <div className="rounded-xl border border-dashed border-line bg-forest-tint p-6 text-center text-sm text-ink-muted">
              No video or YouTube link for this lesson.
            </div>
          )}
        </div>
      </div>

      {lesson.content && (
        <div className="prose prose-sm max-w-none text-ink-muted">
          <p className="whitespace-pre-line">{lesson.content}</p>
        </div>
      )}

      {pdfs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-forest">
            Lesson Resources ({pdfs.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {pdfs.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-line bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-forest-tint text-forest">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="line-clamp-1 text-sm font-medium text-forest">{r.title}</p>
                    <p className="text-xs text-ink-muted">
                      {r.size_bytes ? `${(r.size_bytes / 1024 / 1024).toFixed(2)} MB` : 'PDF Document'}
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleDownload(r)}
                  disabled={downloading === r.id}
                  className="ml-4 shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-forest transition hover:bg-accent-hover disabled:opacity-50"
                >
                  {downloading === r.id ? '...' : 'Download'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assignments & Quizzes */}
      <AssignmentSection 
        lessonId={lesson.id} 
        onSubmitted={() => setError(null)} 
      />

      <QuizSection 
        lessonId={lesson.id} 
        onQuizPassed={() => setError(null)} 
      />

      {/* Completion */}
      <div className="flex flex-col items-end gap-3 border-t border-line pt-6">
        {error && (
          <div className="w-full rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        
        {isCompleted ? (
          <span className="flex items-center gap-2 text-sm font-medium text-accent">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            Lesson Completed
          </span>
        ) : (
          <Button onClick={markComplete} disabled={completing}>
            {completing ? 'Saving…' : 'Mark as Complete'}
          </Button>
        )}
      </div>
    </div>
  );
}