import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/common/PageHeader';
import { Button } from '../../../components/ui/Button';

// Mock data to demonstrate the UI
// In a real app, this would come from a hook like `useMyAssignments()`
const MOCK_ASSIGNMENTS = [
  {
    id: '1',
    courseTitle: 'Introduction to Python',
    lessonTitle: 'Variables and Data Types',
    title: 'Build a Calculator',
    dueDate: '2026-11-20',
    status: 'pending' as const,
    score: null,
    maxScore: 100,
  },
  {
    id: '2',
    courseTitle: 'Web Development',
    lessonTitle: 'HTML Basics',
    title: 'Create a Portfolio Page',
    dueDate: '2026-11-18',
    status: 'submitted' as const,
    score: null,
    maxScore: 100,
  },
  {
    id: '3',
    courseTitle: 'Computer Science Fundamentals',
    lessonTitle: 'Algorithms',
    title: 'Sorting Algorithm Analysis',
    dueDate: '2026-11-10',
    status: 'graded' as const,
    score: 95,
    maxScore: 100,
  },
];

type FilterTab = 'all' | 'pending' | 'submitted' | 'graded';

const STATUS_META = {
  pending: {
    label: 'Pending',
    badge: 'bg-[#FDEBC8] text-[#111111]',
    dot: 'bg-[#111111] animate-pulse',
    accentBorder: 'border-l-[#F59E0B]',
  },
  submitted: {
    label: 'Submitted',
    badge: 'bg-primary-container text-on-primary-container',
    dot: 'bg-primary',
    accentBorder: 'border-l-primary',
  },
  graded: {
    label: 'Graded',
    badge: 'bg-[#CCF3CE] text-[#111111]',
    dot: 'bg-[#111111]',
    accentBorder: 'border-l-[#22C55E]',
  },
};

export default function AssignmentsPage() {
  const [filter, setFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const counts = {
    all: MOCK_ASSIGNMENTS.length,
    pending: MOCK_ASSIGNMENTS.filter((a) => a.status === 'pending').length,
    submitted: MOCK_ASSIGNMENTS.filter((a) => a.status === 'submitted').length,
    graded: MOCK_ASSIGNMENTS.filter((a) => a.status === 'graded').length,
  };

  const filteredAssignments = MOCK_ASSIGNMENTS.filter((a) => {
    const matchesTab = filter === 'all' || a.status === filter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.courseTitle.toLowerCase().includes(q) ||
      a.lessonTitle.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="w-full space-y-8 pb-12">
      <PageHeader
        title="Assignments"
        subtitle="Manage your coursework, track upcoming deadlines, and review your grades."
      />

      {/* Summary Stats Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Tasks', value: counts.all, sub: 'Across all courses' },
          { label: 'To Do', value: counts.pending, sub: 'Awaiting submission' },
          { label: 'Under Review', value: counts.submitted, sub: 'Submitted to instructor' },
          { label: 'Completed', value: counts.graded, sub: 'Graded & returned' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-surface-container bg-surface-container-lowest p-5 shadow-[0_8px_24px_rgba(18,18,20,0.03)]"
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
          {(['all', 'pending', 'submitted', 'graded'] as FilterTab[]).map((tab) => {
            const active = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold capitalize transition-all ${
                  active
                    ? 'bg-carbon text-white shadow-sm'
                    : 'bg-surface-container-lowest text-on-surface-variant border border-surface-container hover:bg-surface-container/60'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                    active ? 'bg-white/20 text-white' : 'bg-surface-container text-carbon'
                  }`}
                >
                  {counts[tab]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
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
            placeholder="Search assignments or courses…"
            className="w-full rounded-full border border-surface-container bg-surface-container-lowest py-2 pl-10 pr-4 text-sm font-medium text-carbon placeholder:text-outline focus:border-carbon focus:outline-none"
          />
        </div>
      </div>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-14 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-carbon">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-extrabold text-carbon">No assignments found</h3>
          <p className="mt-1 text-sm font-medium text-on-surface-variant">
            {searchQuery
              ? 'Try adjusting your search term or clearing the active filter.'
              : "You don't have any assignments in this category right now."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const meta = STATUS_META[assignment.status];

            return (
              <div
                key={assignment.id}
                className={`flex flex-col justify-between gap-6 rounded-xl border border-l-4 border-surface-container ${meta.accentBorder} bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(18,18,20,0.03)] transition-all hover:shadow-[0_12px_28px_rgba(18,18,20,0.07)] lg:flex-row lg:items-center`}
              >
                {/* Left: Course, Title & Lesson */}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold tracking-tight ${meta.badge}">
                      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>

                    <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                      {assignment.courseTitle}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-carbon sm:text-xl">
                    {assignment.title}
                  </h3>

                  <p className="text-sm font-medium text-on-surface-variant">
                    Lesson: <span className="font-semibold text-carbon">{assignment.lessonTitle}</span>
                  </p>
                </div>

                {/* Right: Metadata, Score & Action */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-surface-container pt-4 sm:flex-nowrap lg:justify-end lg:border-t-0 lg:pt-0">
                  {assignment.status === 'graded' && assignment.score !== null ? (
                    <div className="rounded-lg border border-surface-container bg-surface-container/50 px-4 py-2 text-right">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-outline">
                        Final Score
                      </span>
                      <span className="text-lg font-black text-carbon">
                        {assignment.score}
                        <span className="text-xs font-bold text-outline"> / {assignment.maxScore}</span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                      <svg
                        className="h-4 w-4 text-outline"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Due {assignment.dueDate}</span>
                    </div>
                  )}

                  <Link to={`/student/classroom/${assignment.id}`} className="shrink-0">
                    <Button
                      className={`rounded-full px-6 py-2.5 text-sm font-extrabold transition-all ${
                        assignment.status === 'pending'
                          ? 'bg-carbon text-white hover:-translate-y-0.5 hover:bg-carbon-light'
                          : 'border border-surface-container bg-white text-carbon hover:bg-surface-container'
                      }`}
                    >
                      {assignment.status === 'pending'
                        ? 'Start Assignment'
                        : assignment.status === 'submitted'
                          ? 'View Submission'
                          : 'Review Grade'}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}