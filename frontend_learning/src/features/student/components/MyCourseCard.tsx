import { Link } from 'react-router-dom';
import type { EnrolledCourse } from '../types';

export function MyCourseCard({ data }: { data: EnrolledCourse }) {
  const { course, progress } = data;
  const pct = progress?.percentage ?? 0;

  return (
    <Link to={`/student/classroom/${course.id}`} className="group block h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white shadow-sm transition group-hover:border-accent/50 group-hover:shadow-md">
        <div className="relative flex aspect-video items-center justify-center bg-forest">
          <span className="text-2xl font-bold tracking-widest text-white/20">
            {course.slug.slice(0, 2).toUpperCase()}
          </span>
          {pct === 100 && (
            <div className="absolute right-2 top-2 rounded bg-accent px-2 py-0.5 text-xs font-bold text-forest shadow-sm">
              Completed
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 text-sm font-semibold text-forest group-hover:text-accent-deep">
            {course.title}
          </h3>
          <div className="mt-auto pt-4">
            <div className="mb-1 flex justify-between text-xs font-medium text-ink-muted">
              <span>Progress</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-forest-tint">
              <div
                className="h-full bg-accent"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}