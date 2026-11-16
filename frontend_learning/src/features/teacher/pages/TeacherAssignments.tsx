import { useState, useMemo } from 'react';
import { useTeacherAssignments } from '../hooks/useTeacherAssignments';
import { GradeSubmissionModal } from '../components/GradeSubmissionModal';
import { PageHeader } from '../../../components/common/PageHeader';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../utils/formatDate';
import type { StudentSubmission } from '../services/teacherService';

type StatusFilter = 'all' | 'pending' | 'graded';

export default function TeacherAssignments() {
  const { submissions, loading, error, refetch, grade, grading } = useTeacherAssignments();
  const [selected, setSelected] = useState<StudentSubmission | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const list = submissions ?? [];

  const counts = useMemo(
    () => ({
      all: list.length,
      pending: list.filter((s) => s.status !== 'graded').length,
      graded: list.filter((s) => s.status === 'graded').length,
    }),
    [list]
  );

  const filteredSubmissions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return list.filter((sub) => {
      const isGraded = sub.status === 'graded';
      const matchesFilter =
        filter === 'all' || (filter === 'graded' ? isGraded : !isGraded);
      const matchesSearch =
        !q ||
        (sub.student_name || '').toLowerCase().includes(q) ||
        (sub.assignment_title || '').toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [list, filter, searchQuery]);

  if (loading) return <LoadingState message="Loading submissions…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col justify-between space-y-8 pb-12">
      <div className="w-full space-y-8">
        <PageHeader
          title="Assignments & Grading"
          subtitle="Review student submissions, assign grades, and provide constructive feedback."
        />

        {/* Summary Stats Strip */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Total Submissions', value: counts.all, sub: 'Across all active courses' },
            { label: 'Needs Grading', value: counts.pending, sub: 'Awaiting instructor review' },
            { label: 'Graded', value: counts.graded, sub: 'Completed & returned' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-surface-container bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(18,18,20,0.03)]"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-carbon">{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-outline">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col justify-between gap-4 border-b border-surface-container pb-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'pending', label: 'Needs Grading' },
                { key: 'graded', label: 'Graded' },
              ] as { key: StatusFilter; label: string }[]
            ).map((tab) => {
              const active = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilter(tab.key)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                    active
                      ? 'bg-carbon text-white shadow-sm'
                      : 'border border-surface-container bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                      active ? 'bg-white/20 text-white' : 'bg-surface-container text-carbon'
                    }`}
                  >
                    {counts[tab.key]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 10.5a7.5 7.5 0 0013.15 6.15z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student or assignment…"
              className="w-full rounded-full border border-surface-container bg-surface-container-lowest py-2 pl-10 pr-4 text-sm font-medium text-carbon placeholder:text-outline focus:border-carbon focus:outline-none"
            />
          </div>
        </div>

        {/* Empty State vs Submissions Table */}
        {list.length === 0 ? (
          <div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-12 text-center shadow-[0_8px_24px_rgba(18,18,20,0.03)]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-carbon">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-carbon">No submissions yet</h3>
            <p className="mt-2 max-w-md text-sm font-medium text-on-surface-variant">
              When students submit assignments for your courses, they will appear here ready for grading.
            </p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-12 text-center">
            <h3 className="text-lg font-extrabold text-carbon">No matching submissions</h3>
            <p className="mt-1 text-sm font-medium text-on-surface-variant">
              Try clearing your search query or switching status tabs.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-surface-container bg-surface-container-lowest shadow-[0_8px_24px_rgba(18,18,20,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-surface-container bg-surface-container/60">
                  <tr>
                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-on-surface-variant">
                      Student
                    </th>
                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-on-surface-variant">
                      Assignment
                    </th>
                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-on-surface-variant">
                      Submitted
                    </th>
                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-on-surface-variant">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-wider text-on-surface-variant">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {filteredSubmissions.map((sub) => {
                    const isGraded = sub.status === 'graded';
                    const studentName = sub.student_name || 'Student';
                    const initials = studentName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <tr key={sub.id} className="transition hover:bg-surface-container/40">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container text-xs font-extrabold text-carbon">
                              {initials}
                            </div>
                            <span className="font-bold text-carbon">{studentName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-carbon">
                          {sub.assignment_title || 'Assignment'}
                        </td>
                        <td className="px-6 py-4 font-medium text-on-surface-variant">
                          {formatDate(sub.submitted_at)}
                        </td>
                        <td className="px-6 py-4">
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
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            size="sm"
                            className={`rounded-full px-5 font-extrabold transition-all ${
                              isGraded
                                ? 'border border-surface-container bg-white text-carbon hover:bg-surface-container'
                                : 'bg-carbon text-white hover:-translate-y-0.5 hover:bg-carbon-light'
                            }`}
                            onClick={() => setSelected(sub)}
                          >
                            {isGraded ? 'Review' : 'Grade'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Blurred Backdrop Wrapper around GradeSubmissionModal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/50 backdrop-blur-md">
          <GradeSubmissionModal
            submission={selected}
            onClose={() => setSelected(null)}
            onGrade={grade}
            isGrading={grading}
          />
        </div>
      )}
    </div>
  );
}