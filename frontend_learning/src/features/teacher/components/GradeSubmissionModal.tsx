import { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../utils/formatDate';
import type { StudentSubmission } from '../services/teacherService';

interface GradeSubmissionModalProps {
  submission: StudentSubmission | null;
  onClose: () => void;
  onGrade: (id: string, score: number, feedback: string) => Promise<void>;
  isGrading: boolean;
}

export function GradeSubmissionModal({
  submission,
  onClose,
  onGrade,
  isGrading,
}: GradeSubmissionModalProps) {
  const [score, setScore] = useState(submission?.score?.toString() ?? '');
  const [feedback, setFeedback] = useState(submission?.feedback ?? '');

  // Determine the assignment's max grade (defaults to 100 if not present on submission)
  const maxScore = Number((submission as any)?.max_score ?? (submission as any)?.maxScore ?? 100);

  // Sync local state whenever a different submission is opened
  useEffect(() => {
    setScore(submission?.score?.toString() ?? '');
    setFeedback(submission?.feedback ?? '');
  }, [submission]);

  // Lock body scroll & close on Escape
  useEffect(() => {
    if (!submission) return;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isGrading) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [submission, isGrading, onClose]);

  if (!submission) return null;

  const isGraded = submission.status === 'graded';
  const studentName = submission.student_name || 'Student';
  const initials = studentName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Score validation
  const numericScore = Number(score);
  const hasScore = score.trim() !== '';
  const isBelowMin = hasScore && (Number.isNaN(numericScore) || numericScore < 0);
  const exceedsMax = hasScore && !Number.isNaN(numericScore) && numericScore > maxScore;
  const isScoreInvalid = !hasScore || isBelowMin || exceedsMax;

  function handleScoreChange(value: string) {
    if (value === '') {
      setScore('');
      return;
    }
    const parsed = Number(value);
    // Prevent typing/pasting values above maxScore or below 0
    if (!Number.isNaN(parsed) && parsed > maxScore) {
      setScore(String(maxScore));
      return;
    }
    if (!Number.isNaN(parsed) && parsed < 0) {
      setScore('0');
      return;
    }
    setScore(value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isScoreInvalid || !submission) return;
    await onGrade(submission.id, numericScore, feedback);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/50 p-4 backdrop-blur-md sm:p-6 lg:p-10"
      onClick={() => !isGrading && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="grade-modal-title"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-surface-container bg-surface-container-lowest shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-surface-container px-6 py-5 sm:px-8 sm:py-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {isGraded ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#CCF3CE] px-3 py-1 text-xs font-bold tracking-tight text-[#111111]">
                  <span className="h-2 w-2 rounded-full bg-[#111111]" />
                  Graded
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#FDEBC8] px-3 py-1 text-xs font-bold tracking-tight text-[#111111]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#111111]" />
                  Needs Grading
                </span>
              )}

              {submission.submitted_at && (
                <span className="text-xs font-bold text-outline">
                  Submitted {formatDate(submission.submitted_at)}
                </span>
              )}
            </div>

            <h2 id="grade-modal-title" className="text-2xl font-black text-carbon sm:text-3xl">
              {submission.assignment_title || 'Assignment Submission'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isGrading}
            aria-label="Close modal"
            className="rounded-full border border-surface-container p-2 text-on-surface-variant transition hover:bg-surface-container hover:text-carbon disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <form
          id="grade-submission-form"
          onSubmit={handleSubmit}
          className="flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8"
        >
          {/* Student Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-surface-container bg-surface-container/35 p-4 sm:px-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-carbon text-sm font-extrabold text-white">
                {initials}
              </div>
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-outline">
                  Submitted By
                </span>
                <p className="text-base font-extrabold text-carbon">{studentName}</p>
              </div>
            </div>

            {submission.score !== undefined && submission.score !== null && (
              <div className="rounded-lg border border-surface-container bg-white px-4 py-2 text-right">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-outline">
                  Current Grade
                </span>
                <span className="text-lg font-black text-carbon">
                  {submission.score}
                  <span className="text-xs font-bold text-outline"> / {maxScore}</span>
                </span>
              </div>
            )}
          </div>

          {/* Student Response & Attachment */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant">
              Student Submission
            </h3>
            <div className="space-y-4 rounded-xl border border-surface-container bg-white p-5 sm:p-6">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-carbon">
                {submission.text || 'No written response provided.'}
              </p>

              {submission.file_public_id && (
                <div className="border-t border-surface-container pt-4">
                  <a
                    href="#"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-surface-container bg-surface-container/50 px-4 py-2 text-xs font-extrabold text-primary transition hover:bg-surface-container"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                    <span>View Attached File</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Grading Inputs */}
          <div className="space-y-5 border-t border-surface-container pt-6">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant">
              Evaluation & Feedback
            </h3>

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-1">
                <Input
                  id="score"
                  label={`Score (out of ${maxScore})`}
                  type="number"
                  min="0"
                  max={maxScore}
                  step="any"
                  placeholder={`0 - ${maxScore}`}
                  value={score}
                  onChange={(e) => handleScoreChange(e.target.value)}
                  required
                  disabled={isGrading}
                />
                {exceedsMax ? (
                  <p className="text-xs font-bold text-error">
                    Grade cannot exceed the maximum of {maxScore}.
                  </p>
                ) : isBelowMin ? (
                  <p className="text-xs font-bold text-error">
                    Grade cannot be less than 0.
                  </p>
                ) : (
                  <p className="text-xs font-medium text-outline">
                    Maximum allowed grade: <span className="font-bold text-carbon">{maxScore}</span>
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Textarea
                  id="feedback"
                  label="Feedback for Student"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={5}
                  placeholder="Great work! Here are some areas for improvement..."
                  required
                  disabled={isGrading}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex flex-col-reverse justify-end gap-3 border-t border-surface-container bg-surface-container/20 px-6 py-4 sm:flex-row sm:items-center sm:px-8">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isGrading}
            className="rounded-full px-6 font-bold text-on-surface-variant hover:bg-surface-container"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="grade-submission-form"
            disabled={isGrading || isScoreInvalid || !feedback.trim()}
            className="rounded-full bg-carbon px-8 py-2.5 text-sm font-extrabold text-white transition-all hover:bg-carbon-light disabled:opacity-50"
          >
            {isGrading ? 'Saving…' : isGraded ? 'Update Grade' : 'Submit Grade'}
          </Button>
        </div>
      </div>
    </div>
  );
}