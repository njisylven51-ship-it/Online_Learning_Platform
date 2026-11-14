import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import type { StudentSubmission } from '../services/teacherService';

interface GradeSubmissionModalProps {
  submission: StudentSubmission | null;
  onClose: () => void;
  onGrade: (id: string, score: number, feedback: string) => Promise<void>;
  isGrading: boolean;
}

export function GradeSubmissionModal({ submission, onClose, onGrade, isGrading }: GradeSubmissionModalProps) {
  const [score, setScore] = useState(submission?.score?.toString() || '');
  const [feedback, setFeedback] = useState(submission?.feedback || '');

  if (!submission) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!score) return;
    await onGrade(submission.id, Number(score), feedback);
    onClose();
  }

  return (
    <Modal
      open={!!submission}
      onClose={onClose}
      title={`Grade: ${submission.assignment_title || 'Assignment'}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isGrading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isGrading || !score}>
            {isGrading ? 'Saving…' : 'Submit Grade'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-forest-tint p-4">
          <p className="text-sm font-medium text-forest">Student: {submission.student_name}</p>
          <p className="mt-2 text-sm text-ink-muted whitespace-pre-wrap">{submission.text || 'No text provided.'}</p>
          
          {submission.file_public_id && (
            <a 
              href={`#`} // In a real app, you'd fetch the signed URL from the backend here
              className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
              target="_blank"
            >
              View Attached File ↗
            </a>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="score"
            label="Score (out of 100)"
            type="number"
            min="0"
            max="100"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            required
          />
          <Textarea
            id="feedback"
            label="Feedback for Student"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            placeholder="Great work! Here are some areas for improvement..."
            required
          />
        </form>
      </div>
    </Modal>
  );
}