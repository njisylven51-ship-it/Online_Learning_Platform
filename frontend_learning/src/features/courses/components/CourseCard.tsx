import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../utils/formatCurrency';
import type { Course } from '../types';

interface CourseCardProps {
  course: Course;
  categoryName?: string;
}

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function CourseCard({ course, categoryName }: CourseCardProps) {
  const initials = course.slug.slice(0, 2).toUpperCase();

  return (
    <Link to={`/courses/${course.id}`} className="group block h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-accent/60 group-hover:shadow-md">
        {/* Thumbnail */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-forest to-forest-soft">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold tracking-widest text-white/20">
              {initials}
            </span>
          </div>
          {categoryName && (
            <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-forest">
              {categoryName}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-subtle">
            {LEVEL_LABEL[course.level] ?? course.level}
          </div>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-forest transition group-hover:text-accent-deep">
            {course.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 flex-1 text-xs text-ink-muted">
            {course.description}
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <span className="text-xs text-ink-subtle">Enroll now</span>
            <span className="text-sm font-bold text-accent-deep">
              {formatCurrency(course.price_xaf)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}