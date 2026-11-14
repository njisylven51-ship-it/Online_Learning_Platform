import { Link } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';
import type { Course } from '../../courses/types';
import { formatCurrency } from '../../../utils/formatCurrency';

export function TeacherCourseCard({ course }: { course: Course }) {
  const statusTone =
    course.status === 'published' ? 'success' :
    course.status === 'pending_review' ? 'warning' :
    course.status === 'rejected' ? 'danger' : 'neutral';

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-sm">
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between">
          <Badge tone={statusTone}>
            {course.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <span className="text-xs font-medium text-ink-muted">
            {formatCurrency(course.price_xaf)}
          </span>
        </div>
        <h3 className="line-clamp-2 text-base font-bold text-forest">{course.title}</h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink-muted">
          {course.description}
        </p>
      </div>
      <div className="border-t border-line bg-forest-tint p-3">
        <Link
          to={`/teacher/courses/${course.id}/edit`}
          className="flex w-full items-center justify-center rounded-lg border border-line bg-white py-2 text-sm font-medium text-forest transition hover:bg-forest hover:text-white"
        >
          Manage Course
        </Link>
      </div>
    </div>
  );
}