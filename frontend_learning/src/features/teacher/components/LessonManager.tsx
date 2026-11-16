import { useState, useEffect, type FormEvent } from 'react';
import { useLessonManager } from '../hooks/useLessonManager';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { QuizBuilder } from './QuizBuilder';
import { Modal } from '../../../components/ui/Modal';
import { VideoPlayer } from '../../classroom/components/VideoPlayer';

export function LessonManager({ moduleId }: { moduleId: string }) {
  const { 
    lessons, resources, assignments, quizzes, loading, creating, uploadingVideo, uploadingPdf, creatingAssignment,
    fetchLessons, createLesson, uploadVideo, uploadPdf, createAssignment
  } = useLessonManager(moduleId);

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Assignment Form State
  const [assigningToLessonId, setAssigningToLessonId] = useState<string | null>(null);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignMaxScore, setAssignMaxScore] = useState('100');

  // Quiz Builder State
  const [quizzingLessonId, setQuizzingLessonId] = useState<string | null>(null);

  // Preview Modal State
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);

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
    e.target.value = '';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-extrabold text-carbon">Lessons</h4>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="rounded-lg bg-carbon text-white font-bold px-5">
            + Add Lesson
          </Button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddLesson} className="space-y-4 rounded-xl border border-primary-container bg-primary-container/20 p-6">
          <Input label="Lesson Title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Setting up your environment" />
          <Textarea label="Text Content (Optional)" value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
          <Input label="YouTube URL (Optional)" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="rounded-lg text-on-surface-variant hover:bg-surface-container">
              Cancel
            </Button>
            <Button type="submit" disabled={creating} className="rounded-lg bg-carbon text-white font-bold px-6">
              Save Lesson
            </Button>
          </div>
        </form>
      )}

      {lessons.length === 0 && !isAdding ? (
        <div className="rounded-xl border border-dashed border-outline-variant p-8 text-center">
          <p className="text-sm font-medium text-on-surface-variant">No lessons in this module yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson) => {
            const videos = lesson.videos ?? [];
            const pdfs = resources[lesson.id] ?? [];
            const lessonAssignments = assignments[lesson.id] ?? [];
            const lessonQuizzes = quizzes[lesson.id] ?? [];

            return (
              <div key={lesson.id} className="flex flex-col gap-4 rounded-xl border border-surface-container bg-surface-container-lowest p-6 shadow-sm">
                
                {/* Lesson Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-container pb-4">
                  <div>
                    <h4 className="text-base font-bold text-carbon">{lesson.title}</h4>
                  </div>
                </div>

                {/* Upload Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <label className={`cursor-pointer inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-bold transition ${uploadingVideo === lesson.id ? 'bg-surface-container text-outline' : 'bg-primary-container text-on-primary-container hover:bg-primary-container/80'}`}>
                    {uploadingVideo === lesson.id ? 'Uploading...' : 'Upload Video'}
                    <input type="file" accept="video/*" className="hidden" disabled={uploadingVideo !== null} onChange={(e) => handleFileChange(e, lesson.id)} />
                  </label>

                  <label className={`cursor-pointer inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-bold transition ${uploadingPdf === lesson.id ? 'bg-surface-container text-outline' : 'bg-surface-container text-carbon hover:bg-surface-container-high'}`}>
                    {uploadingPdf === lesson.id ? 'Uploading...' : 'Upload PDF'}
                    <input type="file" accept=".pdf,application/pdf" className="hidden" disabled={uploadingPdf !== null} onChange={(e) => handlePdfChange(e, lesson.id)} />
                  </label>

                  <Button 
                    size="sm" 
                    className="rounded-lg bg-surface-container text-carbon hover:bg-surface-container-high text-xs font-bold px-4" 
                    onClick={() => setAssigningToLessonId(assigningToLessonId === lesson.id ? null : lesson.id)}
                  >
                    + Assignment
                  </Button>

                  <Button 
                    size="sm" 
                    className="rounded-lg bg-surface-container text-carbon hover:bg-surface-container-high text-xs font-bold px-4" 
                    onClick={() => setQuizzingLessonId(quizzingLessonId === lesson.id ? null : lesson.id)}
                  >
                    + Quiz
                  </Button>
                </div>

                {/* Media & Resources Preview */}
                {(videos.length > 0 || pdfs.length > 0) && (
                  <div className="mt-2 rounded-lg bg-surface-container/50 p-4">
                    <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-outline mb-3">Uploaded Media & Resources</h5>
                    <div className="flex flex-wrap gap-3">
                      {videos.map((v: any, idx: number) => (
                        <button 
                          key={v.id}
                          onClick={() => setPreviewVideoId(v.id)}
                          className="flex items-center gap-2 rounded-lg border border-surface-container bg-surface-container-lowest px-4 py-2 text-sm font-bold text-carbon shadow-sm transition hover:bg-surface-container-high"
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                          Play Video {videos.length > 1 ? `#${idx + 1}` : ''}
                        </button>
                      ))}

                      {pdfs.map((r: any) => (
                        <a 
                          key={r.id}
                          href={r.download_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-lg border border-surface-container bg-surface-container-lowest px-4 py-2 text-sm font-bold text-carbon shadow-sm transition hover:bg-surface-container-high"
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </div>
                          View {r.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assessments Preview */}
                {(lessonAssignments.length > 0 || lessonQuizzes.length > 0) && (
                  <div className="mt-2 rounded-lg bg-surface-container/50 p-4">
                    <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-outline mb-3">Assessments</h5>
                    <div className="flex flex-wrap gap-3">
                      {lessonAssignments.map((a: any) => (
                        <div key={a.id} className="flex items-center gap-2 rounded-lg border border-surface-container bg-surface-container-lowest px-4 py-2 text-sm font-bold text-carbon shadow-sm">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary-container">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          </div>
                          Assignment: {a.title} (Max: {a.max_score})
                        </div>
                      ))}
                      {lessonQuizzes.map((q: any) => (
                        <div key={q.id} className="flex items-center gap-2 rounded-lg border border-surface-container bg-surface-container-lowest px-4 py-2 text-sm font-bold text-carbon shadow-sm">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                          Quiz: {q.title} (Pass: {q.passing_score}%)
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Assignment Form */}
                {assigningToLessonId === lesson.id && (
                  <form onSubmit={(e) => handleAddAssignment(e, lesson.id)} className="mt-2 space-y-4 rounded-xl border border-tertiary-container bg-tertiary-container/20 p-5">
                    <h5 className="text-sm font-extrabold text-on-tertiary-container">New Assignment</h5>
                    <Input label="Assignment Title" value={assignTitle} onChange={(e) => setAssignTitle(e.target.value)} required />
                    <Textarea label="Instructions" value={assignDesc} onChange={(e) => setAssignDesc(e.target.value)} rows={2} required />
                    <Input label="Max Score" type="number" value={assignMaxScore} onChange={(e) => setAssignMaxScore(e.target.value)} required />
                    <div className="flex justify-end gap-3 pt-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setAssigningToLessonId(null)} className="rounded-lg text-on-surface-variant hover:bg-surface-container">
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" disabled={creatingAssignment === lesson.id} className="rounded-lg bg-carbon text-white font-bold px-5">
                        Save Assignment
                      </Button>
                    </div>
                  </form>
                )}

                {/* Quiz Builder */}
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

      {/* Video Preview Modal */}
      <Modal
        open={!!previewVideoId}
        onClose={() => setPreviewVideoId(null)}
        title="Video Preview"
      >
        {previewVideoId && (
          <VideoPlayer videoId={previewVideoId} onComplete={() => {}} />
        )}
      </Modal>
    </div>
  );
}