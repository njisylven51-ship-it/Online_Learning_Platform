import { useState } from 'react';
import { useLessonAssignments } from '../hooks/useLessonAssignments';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import { formatDate } from '../../../utils/formatDate';

interface AssignmentSectionProps {
  lessonId: string;
  onSubmitted?: () => void;
}

export function AssignmentSection({ lessonId, onSubmitted }: AssignmentSectionProps) {
  const { assignments, submissions, loading, submitting, error, submit } =
    useLessonAssignments(lessonId);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});

  if (loading) return null;
  if (assignments.length === 0) return null;

  async function handleSubmit(assignmentId: string) {
    const text = drafts[assignmentId]?.trim() || '';
    const file = selectedFiles[assignmentId] || null;

    if (!text && !file) {
      alert('Please write some text or attach a PDF file before submitting.');
      return;
    }

    try {
      await submit(assignmentId, text, file);
      setActiveId(null);
      setSelectedFiles((prev) => ({ ...prev, [assignmentId]: null }));
      onSubmitted?.();
    } catch {
      // Error is handled in the hook and displayed in the UI
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-forest">Assignments ({assignments.length})</h3>
      
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {assignments.map((a) => {
        const sub = submissions[a.id];
        const isGraded = sub?.status === 'graded';
        const isSubmitted = sub && !isGraded;
        const isEditing = activeId === a.id;
        const file = selectedFiles[a.id];

        return (
          <div key={a.id} className="rounded-xl border border-line bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-forest">{a.title}</h4>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Badge tone="neutral">Max {a.max_score} pts</Badge>
                  {a.due_at && <Badge tone="warning">Due {formatDate(a.due_at)}</Badge>}
                  {isGraded && <Badge tone="success">Graded: {sub.score}/{a.max_score}</Badge>}
                  {isSubmitted && <Badge tone="info">Submitted</Badge>}
                </div>
              </div>
            </div>

            <p className="mt-3 whitespace-pre-line text-sm text-ink-muted">{a.instructions}</p>

            {isGraded && (
              <div className="mt-3 rounded-lg bg-forest-tint p-3">
                <p className="text-xs font-semibold text-forest">Your submission:</p>
                <p className="mt-1 whitespace-pre-line text-sm text-ink-muted">
                  {/* Changed to text_submission */}
                  {sub.text_submission || '(no text)'}
                </p>
                {sub.file_public_id && (
                  <p className="mt-1 text-xs font-medium text-accent">[File attached]</p>
                )}
                <p className="mt-3 text-xs font-semibold text-forest">Feedback:</p>
                <p className="mt-1 whitespace-pre-line text-sm text-ink-muted">
                  {sub.feedback || '(no feedback)'}
                </p>
              </div>
            )}

            {isSubmitted && !isEditing && (
              <div className="mt-3 rounded-lg bg-forest-tint p-3">
                <p className="text-xs font-semibold text-forest">Your submission:</p>
                <p className="mt-1 whitespace-pre-line text-sm text-ink-muted">
                  {/* Changed to text_submission */}
                  {sub.text_submission || '(no text)'}
                </p>
                {sub.file_public_id && (
                  <p className="mt-1 text-xs font-medium text-accent">[File attached]</p>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3"
                  onClick={() => {
                    setActiveId(a.id);
                    // Changed to text_submission
                    setDrafts({ ...drafts, [a.id]: sub.text_submission || '' });
                  }}
                >
                  Edit submission
                </Button>
              </div>
            )}

            {isEditing && (
              <div className="mt-3 space-y-3">
                <Textarea
                  label="Your answer (optional if submitting a file)"
                  value={drafts[a.id] || ''}
                  onChange={(e) => setDrafts({ ...drafts, [a.id]: e.target.value })}
                  rows={4}
                  placeholder="Write your answer here…"
                />
                
                <div>
                  <label className="block text-sm font-medium text-forest mb-1">
                    Attach PDF (optional)
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) =>
                      setSelectedFiles({ ...selectedFiles, [a.id]: e.target.files?.[0] || null })
                    }
                    className="block w-full text-sm text-ink-muted file:mr-4 file:rounded-lg file:border-0 file:bg-forest-tint file:px-4 file:py-2 file:text-sm file:font-semibold file:text-forest hover:file:bg-forest-tint-strong"
                  />
                  {file && <p className="mt-1 text-xs text-accent">Attached: {file.name}</p>}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setActiveId(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSubmit(a.id)}
                    disabled={submitting === a.id}
                  >
                    {submitting === a.id ? 'Uploading & Submitting…' : 'Submit'}
                  </Button>
                </div>
              </div>
            )}

            {!sub && !isEditing && (
              <Button
                size="sm"
                className="mt-3"
                onClick={() => {
                  setActiveId(a.id);
                  setDrafts({ ...drafts, [a.id]: '' });
                }}
              >
                Submit Assignment
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}