import { Link } from 'react-router-dom';
import type { EnrolledCourse } from '../types';
import { formatCurrency } from '../../../utils/formatCurrency';

export function ContinueLearningCard({ data }: { data: EnrolledCourse }) {
  const { course, progress } = data;
  const pct = progress?.percentage ?? 0;
  const isComplete = pct === 100;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line bg-white p-5 shadow-sm sm:flex-row sm:items-center">
      <div className="h-24 w-full shrink-0 overflow-hidden rounded-lg bg-forest sm:w-40">
        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-white/20">
          {course.slug.slice(0, 2).toUpperCase()}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-forest">{course.title}</h3>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-forest-tint">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-medium text-ink-muted">{pct}%</span>
        </div>
      </div>
      <div className="mt-4 shrink-0 sm:mt-0">
        <Link
          to={`/student/classroom/${course.id}`}
          className="inline-flex w-full items-center justify-center rounded-lg bg-forest px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-forest-soft sm:w-auto"
        >
          {isComplete ? 'Review Course' : 'Continue Learning'}
        </Link>
      </div>
    </div>
  );
}