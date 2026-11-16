import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../utils/formatCurrency';
import type { Course } from '../../courses/types';

export function TeacherCourseCard({ course }: { course: Course }) {
  const statusTone =
    course.status === 'published' ? 'bg-secondary-container text-on-secondary-container' :
    course.status === 'pending_review' ? 'bg-tertiary-container text-on-tertiary-container' :
    course.status === 'rejected' ? 'bg-error-container text-on-error-container' : 
    'bg-surface-container text-on-surface-variant';

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-surface-container bg-surface-container-lowest shadow-[0_8px_24px_rgba(18,18,20,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(210,189,246,0.25)]">
      
      {/* Thumbnail Area */}
      <div className="relative flex aspect-video items-center justify-center bg-surface-container overflow-hidden">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />
        ) : (
          <span className="text-4xl font-extrabold tracking-widest text-outline/20">
            {(course.slug || course.title || 'CO').slice(0, 2).toUpperCase()}
          </span>
        )}
        <div className="absolute top-4 left-4">
          <span className={`rounded-lg px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-sm backdrop-blur-md ${statusTone}`}>
            {course.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-extrabold text-carbon">
            {formatCurrency(course.price_xaf)}
          </span>
        </div>
        <h3 className="line-clamp-2 text-lg font-bold text-carbon">{course.title}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm font-medium text-on-surface-variant">
          {course.description}
        </p>
      </div>
      <div className="border-t border-surface-container p-4">
        <Link
          to={`/teacher/courses/${course.id}/edit`}
          className="flex w-full items-center justify-center rounded-lg bg-surface-container py-2.5 text-sm font-bold text-carbon transition hover:bg-surface-container-high"
        >
          Manage Course
        </Link>
      </div>
    </div>
  );
}