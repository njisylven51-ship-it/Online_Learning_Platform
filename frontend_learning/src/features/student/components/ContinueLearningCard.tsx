import { Link } from 'react-router-dom';
import type { EnrolledCourse } from '../types';

export function ContinueLearningCard({ data }: { data: EnrolledCourse }) {
  const { course, progress } = data;
  const pct = progress?.percentage ?? 0;
  const isComplete = pct === 100;

  return (
    <div className="flex flex-col gap-6 rounded-[2rem] bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(18,18,20,0.04)] sm:flex-row sm:items-center">
      <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-[24px] bg-surface-container sm:w-48">
        <span className="text-4xl font-extrabold text-outline/20">{course.slug.slice(0, 2).toUpperCase()}</span>
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-extrabold text-carbon">{course.title}</h3>
        <div className="mt-4 flex items-center gap-4">
          <div className="h-3 w-full max-w-sm overflow-hidden rounded-full bg-surface-container">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm font-bold text-primary">{pct}%</span>
        </div>
      </div>
      <div className="mt-2 shrink-0 sm:mt-0">
        <Link
          to={`/student/classroom/${course.id}`}
          className="inline-flex w-full items-center justify-center rounded-full bg-carbon px-8 py-3.5 text-sm font-bold text-white transition hover:bg-carbon-light hover:scale-[0.97] sm:w-auto"
        >
          {isComplete ? 'Review Course' : 'Continue Learning'}
        </Link>
      </div>
    </div>
  );
}