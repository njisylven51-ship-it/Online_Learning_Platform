import { useState, useEffect, type FormEvent } from 'react';
import { useLessonManager } from '../hooks/useLessonManager';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Badge } from '../../../components/ui/Badge';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { QuizBuilder } from './QuizBuilder';

export function LessonManager({ moduleId }: { moduleId: string }) {
  const { 
    lessons, loading, creating, uploadingVideo, uploadingPdf, creatingAssignment,
    fetchLessons, createLesson, uploadVideo, uploadPdf, createAssignment
  } = useLessonManager(moduleId);

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const [assigningToLessonId, setAssigningToLessonId] = useState<string | null>(null);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignMaxScore, setAssignMaxScore] = useState('100');

  const [quizzingLessonId, setQuizzingLessonId] = useState<string | null>(null);

  useEffect(() => {
    void fetchLessons();
  }, [fetchLessons]);

  async function handleAddLesson(e: FormEvent) {
    e.preventDefault();
    await createLesson({ title, content, position: lessons.length, youtube_url: youtubeUrl || null });
    setTitle(''); setContent(''); setYoutubeUrl(''); setIsAdding(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, lessonId: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { alert('Please select a valid video file.'); return; }
    void uploadVideo(lessonId, file);
    e.target.value = ''; // reset so they can upload the same file again
  }

  function handlePdfChange(e: React.ChangeEvent<HTMLInputElement>, lessonId: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isPdfMime = file.type === 'application/pdf';
    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
    if (!isPdfMime && !isPdfExt) { alert('Invalid file type. Only PDFs are allowed.'); return; }
    void uploadPdf(lessonId, file, file.name);
    e.target.value = '';
  }

  async function handleAddAssignment(e: FormEvent, lessonId: string) {
    e.preventDefault();
    await createAssignment(lessonId, { title: assignTitle, instructions: assignDesc, max_score: Number(assignMaxScore) });
    setAssigningToLessonId(null); setAssignTitle(''); setAssignDesc('');
  }

  if (loading) return <LoadingState message="Loading lessons…" />;

  return (
    <div className="mt-4 space-y-4 border-l-4 border-accent-tint bg-forest-tint/30 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold uppercase tracking-wider text-forest">Lessons</h4>
        {!isAdding && <Button size="sm" variant="secondary" onClick={() => setIsAdding(true)}>+ Add Lesson</Button>}
      </div>

      {isAdding && (
        <form onSubmit={handleAddLesson} className="rounded-xl border border-line bg-white p-4 shadow-sm space-y-4">
          <Input label="Lesson Title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Setting up your environment" />
          <Textarea label="Text Content (Optional)" value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
          <Input label="YouTube URL (Optional)" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={creating}>Save Lesson</Button>
          </div>
        </form>
      )}

      {lessons.length === 0 && !isAdding ? (
        <p className="text-sm text-ink-muted">No lessons in this module yet.</p>
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson) => {
            const videos = lesson.videos ?? [];
            const readyVideos = videos.filter((v: any) => v.status === 'ready');

            return (
              <div key={lesson.id} className="flex flex-col gap-3 rounded-lg border border-line bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-forest">{lesson.title}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {lesson.youtube_url && <Badge tone="info">YouTube</Badge>}
                      {readyVideos.length > 0 && (
                        <Badge tone="success">
                          {readyVideos.length} Video{readyVideos.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                      {!lesson.youtube_url && readyVideos.length === 0 && (
                        <Badge tone="neutral">Text Only</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Show what's uploaded */}
                {readyVideos.length > 0 && (
                  <div className="text-xs text-ink-muted">
                    <span className="font-medium text-forest">Uploaded videos:</span>{' '}
                    {readyVideos.map((v: any, i: number) => `#${i + 1} (${v.format})`).join(', ')}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
                  <label className={`cursor-pointer inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition ${uploadingVideo === lesson.id ? 'bg-gray-100 text-gray-400' : 'bg-accent-tint text-accent-deep hover:bg-accent hover:text-forest'}`}>
                    {uploadingVideo === lesson.id ? 'Uploading...' : '+ Upload Video'}
                    <input type="file" accept="video/*" className="hidden" disabled={uploadingVideo !== null} onChange={(e) => handleFileChange(e, lesson.id)} />
                  </label>

                  <label className={`cursor-pointer inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition ${uploadingPdf === lesson.id ? 'bg-gray-100 text-gray-400' : 'bg-forest-tint text-forest hover:bg-forest hover:text-white'}`}>
                    {uploadingPdf === lesson.id ? 'Uploading...' : '+ Upload PDF'}
                    <input type="file" accept=".pdf,application/pdf" className="hidden" disabled={uploadingPdf !== null} onChange={(e) => handlePdfChange(e, lesson.id)} />
                  </label>

                  <Button size="sm" variant="secondary" className="text-xs" onClick={() => setAssigningToLessonId(assigningToLessonId === lesson.id ? null : lesson.id)}>
                    + Assignment
                  </Button>

                  <Button size="sm" variant="secondary" className="text-xs" onClick={() => setQuizzingLessonId(quizzingLessonId === lesson.id ? null : lesson.id)}>
                    + Quiz
                  </Button>
                </div>

                {assigningToLessonId === lesson.id && (
                  <form onSubmit={(e) => handleAddAssignment(e, lesson.id)} className="mt-2 space-y-3 rounded-lg border border-accent bg-accent-tint p-3">
                    <Input label="Assignment Title" value={assignTitle} onChange={(e) => setAssignTitle(e.target.value)} required />
                    <Textarea label="Instructions" value={assignDesc} onChange={(e) => setAssignDesc(e.target.value)} rows={2} required />
                    <Input label="Max Score" type="number" value={assignMaxScore} onChange={(e) => setAssignMaxScore(e.target.value)} required />
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setAssigningToLessonId(null)}>Cancel</Button>
                      <Button type="submit" size="sm" disabled={creatingAssignment === lesson.id}>Save Assignment</Button>
                    </div>
                  </form>
                )}

                {quizzingLessonId === lesson.id && (
                  <div className="mt-2">
                    <QuizBuilder 
                      lessonId={lesson.id} 
                      onComplete={() => { setQuizzingLessonId(null); fetchLessons(); }} 
                      onCancel={() => setQuizzingLessonId(null)} 
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}