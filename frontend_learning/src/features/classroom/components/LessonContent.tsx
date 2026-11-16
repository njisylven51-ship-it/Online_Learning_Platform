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

function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?.*[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
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

  const allVideos = lesson.videos ?? [];
  
  const mediaItems: MediaItem[] = [
    ...allVideos.map((v, i) => ({
      kind: 'video' as const,
      id: v.id,
      label: allVideos.length > 1 ? `Video ${i + 1}` : 'Video',
      isReady: v.status === 'ready', 
    })),
    ...(lesson.youtube_url ? [{ kind: 'youtube' as const, url: lesson.youtube_url, label: 'YouTube', isReady: true }] : []),
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = mediaItems[selectedIndex];

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
      setError(e?.info?.message || 'Failed to mark lesson as complete.');
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
      if (onRefreshResources) await onRefreshResources();
      const res = await fetch(resource.download_url);
      if (!res.ok) throw new Error(`Failed to fetch file (${res.status})`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resource.title.toLowerCase().endsWith('.pdf') ? resource.title : `${resource.title}.pdf`;
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

  const pdfs = resources.filter(r => r.resource_type === 'document' || r.mime_type === 'application/pdf');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-carbon">{lesson.title}</h1>
        
        {mediaItems.length > 1 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {mediaItems.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedIndex(i)}
                className={[
                  'rounded-full px-5 py-2 text-sm font-bold transition-all border',
                  selectedIndex === i
                    ? 'bg-carbon text-white border-carbon shadow-md'
                    : 'bg-surface-container text-on-surface-variant border-transparent hover:bg-surface-container-high hover:text-carbon',
                  !item.isReady && 'opacity-50'
                ].join(' ')}
              >
                {item.label} {!item.isReady && '(Processing)'}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6">
          {selected?.kind === 'video' && !selected.isReady && (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-surface-container bg-surface-container text-carbon">
              <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-base font-bold">Video is still processing...</p>
            </div>
          )}

          {selected?.kind === 'video' && selected.isReady && (
            <VideoPlayer videoId={selected.id} onComplete={shouldAutoComplete ? markComplete : () => {}} />
          )}

          {selected?.kind === 'youtube' && (() => {
            const ytId = extractYouTubeId(selected.url);
            return ytId ? (
              <div className="space-y-3">
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-carbon ring-1 ring-surface-container">
                  <iframe src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`} title={lesson.title} className="h-full w-full" allowFullScreen />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-error-container bg-error-container p-4 text-sm font-bold text-on-error-container">
                The YouTube link is invalid.
              </div>
            );
          })()}
        </div>
      </div>

      {lesson.content && (
        <div className="prose prose-sm max-w-none text-on-surface-variant text-lg font-medium leading-relaxed">
          <p className="whitespace-pre-line">{lesson.content}</p>
        </div>
      )}

      {pdfs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-extrabold text-carbon">Lesson Resources</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {pdfs.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-2xl border border-surface-container bg-surface-container-lowest p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <p className="line-clamp-1 text-sm font-bold text-carbon">{r.title}</p>
                    <p className="text-xs font-bold text-on-surface-variant">{r.size_bytes ? `${(r.size_bytes / 1024 / 1024).toFixed(2)} MB` : 'PDF Document'}</p>
                  </div>
                </div>
                <button onClick={() => handleDownload(r)} disabled={downloading === r.id} className="ml-4 shrink-0 rounded-full bg-carbon px-4 py-2 text-xs font-extrabold text-white transition hover:bg-carbon-light disabled:opacity-50">
                  {downloading === r.id ? '...' : 'Download'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <AssignmentSection lessonId={lesson.id} onSubmitted={() => setError(null)} />
      <QuizSection lessonId={lesson.id} onQuizPassed={() => setError(null)} />

      <div className="flex flex-col items-end gap-4 border-t border-surface-container pt-8">
        {error && <div className="w-full rounded-xl border border-error-container bg-error-container p-4 text-sm font-bold text-on-error-container">{error}</div>}
        
        {isCompleted ? (
          <span className="flex items-center gap-2 text-base font-extrabold text-secondary">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            Lesson Completed
          </span>
        ) : (
          <Button onClick={markComplete} disabled={completing} className="rounded-full bg-carbon text-white font-extrabold text-base px-8 py-3.5 hover:bg-carbon-light">
            {completing ? 'Saving…' : 'Mark as Complete'}
          </Button>
        )}
      </div>
    </div>
  );
}