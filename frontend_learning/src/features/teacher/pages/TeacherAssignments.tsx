import { useState } from 'react';
import { useTeacherAssignments } from '../hooks/useTeacherAssignments';
import { GradeSubmissionModal } from '../components/GradeSubmissionModal';
import { PageHeader } from '../../../components/common/PageHeader';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../utils/formatDate';
import type { StudentSubmission } from '../services/teacherService';

export default function TeacherAssignments() {
  const { submissions, loading, error, refetch, grade, grading } = useTeacherAssignments();
  const [selected, setSelected] = useState<StudentSubmission | null>(null);

  if (loading) return <LoadingState message="Loading submissions…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments & Grading"
        subtitle="Review student submissions and provide feedback."
      />

      {/* Backend Warning Banner */}
      {submissions?.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Backend Endpoint Missing:</strong> The endpoint <code>GET /assignments/submissions/mine</code> is not available in the current backend. Once added, student submissions will appear here for grading.
        </div>
      )}

      {!submissions || submissions.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          description="When students submit assignments for your courses, they will appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-forest-tint">
              <tr>
                <th className="px-4 py-3 font-medium text-forest">Student</th>
                <th className="px-4 py-3 font-medium text-forest">Assignment</th>
                <th className="px-4 py-3 font-medium text-forest">Submitted</th>
                <th className="px-4 py-3 font-medium text-forest">Status</th>
                <th className="px-4 py-3 font-medium text-forest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-forest-tint/50">
                  <td className="px-4 py-3 font-medium text-forest">
                    {sub.student_name || 'Student'}
                  </td>
                  <td className="px-4 py-3">{sub.assignment_title || 'Assignment'}</td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(sub.submitted_at)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={sub.status === 'graded' ? 'success' : 'warning'}>
                      {sub.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button 
                      size="sm" 
                      variant={sub.status === 'graded' ? 'secondary' : 'primary'}
                      onClick={() => setSelected(sub)}
                    >
                      {sub.status === 'graded' ? 'Review / Edit' : 'Grade Now'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <GradeSubmissionModal
        submission={selected}
        onClose={() => setSelected(null)}
        onGrade={grade}
        isGrading={grading}
      />
    </div>
  );
}