import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { VideoPlayer } from './VideoPlayer';
import { PdfViewer } from './PdfViewer';
import { classroomService } from '../services/classroomService';
import type { Lesson, Resource } from '../types';

interface LessonContentProps {
  lesson: Lesson;
  resources: Resource[];
  onCompleted: () => void;
}

export function LessonContent({ lesson, resources, onCompleted }: LessonContentProps) {
  const [completing, setCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  async function markComplete() {
    setCompleting(true);
    try {
      await classroomService.updateLessonProgress(lesson.id, true, 0);
      setIsCompleted(true);
      onCompleted();
    } finally {
      setCompleting(false);
    }
  }

  // Extract PDFs from resources
  const pdfs = resources.filter(r => r.type === 'document' || r.type === 'pdf');

  return (
    <div className="space-y-6">
      {/* Media / Content Header */}
      <div>
        <h1 className="text-2xl font-bold text-forest">{lesson.title}</h1>
        <div className="mt-4">
          {lesson.video_id && (
            <VideoPlayer videoId={lesson.video_id} onComplete={markComplete} />
          )}
          {!lesson.video_id && lesson.youtube_url && (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                src={lesson.youtube_url.replace('watch?v=', 'embed/')}
                title={lesson.title}
                className="h-full w-full"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </div>

      {/* Text content */}
      {lesson.content && (
        <div className="prose prose-sm max-w-none text-ink-muted">
          <p className="whitespace-pre-line">{lesson.content}</p>
        </div>
      )}

      {/* Attachments */}
      {pdfs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-forest">Lesson Resources</h3>
          {pdfs.map((r) => (
            <PdfViewer key={r.id} url={r.url} title={r.title} />
          ))}
        </div>
      )}

      {/* Completion */}
      <div className="flex items-center justify-end border-t border-line pt-6">
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