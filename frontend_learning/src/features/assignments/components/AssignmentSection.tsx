import { useState } from 'react';
import { useLessonAssignments } from '../hooks/useLessonAssignments';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import { formatDate } from '../../../utils/formatDate';

interface AssignmentSectionProps {
  lessonId: string;
  onSubmitted?: () => void;
}

export function AssignmentSection({ lessonId, onSubmitted }: AssignmentSectionProps) {
  const { assignments, submissions, loading, submitting, submit } = useLessonAssignments(lessonId);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});

  if (loading || assignments.length === 0) return null;

  async function handleSubmit(assignmentId: string) {
    const text = drafts[assignmentId]?.trim() || '';
    const file = selectedFiles[assignmentId] || null;
    if (!text && !file) { alert('Please provide text or attach a PDF.'); return; }
    await submit(assignmentId, text, file);
    setActiveId(null);
    setSelectedFiles((prev) => ({ ...prev, [assignmentId]: null }));
    onSubmitted?.();
  }

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h3 className="text-2xl font-extrabold text-carbon">Assignments</h3>
      </div>
      
      {assignments.map((a) => {
        const sub = submissions[a.id];
        const isGraded = sub?.status === 'graded';
        const isSubmitted = sub && !isGraded;
        const isEditing = activeId === a.id;
        const file = selectedFiles[a.id];

        return (
          <div key={a.id} className="overflow-hidden rounded-xl border border-surface-container bg-surface-container-lowest shadow-[0_8px_24px_rgba(18,18,20,0.04)]">
            
            {/* Header */}
            <div className="border-b border-surface-container p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h4 className="text-xl font-bold text-carbon">{a.title}</h4>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-surface-container px-3 py-1 text-xs font-bold text-on-surface-variant">
                      Max {a.max_score} pts
                    </span>
                    {a.due_at && (
                      <span className="rounded-lg bg-tertiary-container px-3 py-1 text-xs font-bold text-on-tertiary-container">
                        Due {formatDate(a.due_at)}
                      </span>
                    )}
                    {isGraded && (
                      <span className="rounded-lg bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container">
                        Graded: {sub.score}/{a.max_score}
                      </span>
                    )}
                    {isSubmitted && (
                      <span className="rounded-lg bg-primary-container px-3 py-1 text-xs font-bold text-on-primary-container">
                        Submitted
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-line text-base font-medium leading-relaxed text-on-surface-variant">
                {a.instructions}
              </p>
            </div>

            {/* Graded View */}
            {isGraded && (
              <div className="bg-secondary-container/20 p-6 sm:p-8">
                <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-outline">Your Submission</p>
                  <p className="mt-2 whitespace-pre-line text-sm font-medium text-carbon">
                    {sub.text || sub.text_submission || '(no text provided)'}
                  </p>
                  
                  <div className="mt-6 border-t border-surface-container pt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-outline">Instructor Feedback</p>
                    <p className="mt-2 whitespace-pre-line text-sm font-extrabold text-secondary">
                      {sub.feedback || 'No feedback provided.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submitted View (Not Graded) */}
            {isSubmitted && !isEditing && (
              <div className="bg-primary-container/10 p-6 sm:p-8">
                <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-outline">Your Submission</p>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="rounded-lg bg-surface-container text-carbon hover:bg-surface-container-high h-8 px-4 text-xs" 
                      onClick={() => { setActiveId(a.id); setDrafts({ ...drafts, [a.id]: sub.text || sub.text_submission || '' }); }}
                    >
                      Edit Submission
                    </Button>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm font-medium text-carbon">
                    {sub.text || sub.text_submission || '(no text provided)'}
                  </p>
                </div>
              </div>
            )}

            {/* Editing/Submitting View */}
            {isEditing && (
              <div className="space-y-6 p-6 sm:p-8">
                <Textarea 
                  label="Your Answer" 
                  value={drafts[a.id] || ''} 
                  onChange={(e) => setDrafts({ ...drafts, [a.id]: e.target.value })} 
                  rows={5} 
                  placeholder="Write your answer here..." 
                />
                
                {/* File Dropzone */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-carbon ml-1">Attach PDF (optional)</label>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary-container bg-primary-container/10 py-10 transition hover:bg-primary-container/20">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-carbon">
                      {file ? file.name : 'Click to upload a PDF'}
                    </span>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={(e) => setSelectedFiles({ ...selectedFiles, [a.id]: e.target.files?.[0] || null })} 
                      className="hidden" 
                    />
                  </label>
                  {file && (
                    <button 
                      type="button" 
                      onClick={() => setSelectedFiles({ ...selectedFiles, [a.id]: null })}
                      className="mt-3 text-xs font-bold text-error hover:underline"
                    >
                      Remove attached file
                    </button>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="ghost" onClick={() => setActiveId(null)} className="rounded-lg text-on-surface-variant hover:bg-surface-container">
                    Cancel
                  </Button>
                  <Button onClick={() => handleSubmit(a.id)} disabled={submitting === a.id} className="rounded-lg bg-carbon text-white font-extrabold px-8 hover:bg-carbon-light">
                    {submitting === a.id ? 'Uploading…' : 'Submit Assignment'}
                  </Button>
                </div>
              </div>
            )}

            {/* Start Submission Button */}
            {!sub && !isEditing && (
              <div className="border-t border-surface-container p-6 sm:p-8">
                <Button 
                  className="w-full sm:w-auto rounded-lg bg-carbon text-white font-extrabold px-8 py-3.5 hover:bg-carbon-light" 
                  onClick={() => { setActiveId(a.id); setDrafts({ ...drafts, [a.id]: '' }); }}
                >
                  Start Assignment
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}