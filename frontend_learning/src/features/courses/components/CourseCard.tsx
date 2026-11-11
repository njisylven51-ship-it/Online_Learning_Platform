import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../utils/formatCurrency';
import { Badge } from '../../../components/ui/Badge';
import type { Course } from '../types';

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link to={`/courses/${course.id}`} className="group block">
      <div className="flex h-full flex-col rounded-xl border border-line bg-white p-5 shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-accent/60 group-hover:shadow-md">
        <div className="mb-4 flex aspect-video items-center justify-center rounded-md bg-forest-tint">
          <span className="text-xs font-medium uppercase tracking-wider text-ink-subtle">
            {course.slug.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <h3 className="text-base font-semibold text-forest transition group-hover:text-accent-deep">
          {course.title}
        </h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink-muted">
          {course.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <Badge tone="neutral">{LEVEL_LABEL[course.level] ?? course.level}</Badge>
          <span className="text-sm font-semibold text-forest">
            {formatCurrency(course.price_xaf)}
          </span>
        </div>
      </div>
    </Link>
  );
}