import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { formatCurrency } from '../../../utils/formatCurrency';
import type { Course } from '../types';

interface CourseCardProps {
  course: Course;
  categoryName?: string;
  basePath?: string;
}

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function CourseCard({ course, categoryName, basePath }: CourseCardProps) {
  const { role } = useAuth();
  const resolvedBasePath = basePath || (role === 'student' ? '/student/courses' : '/courses');
  const initials = (course.slug || course.title || 'CO').slice(0, 2).toUpperCase();

  return (
    <Link
      to={`${resolvedBasePath}/${course.id}`}
      className="group block h-full focus:outline-none"
    >
      <article className="relative flex h-full flex-col overflow-hidden rounded-[24px] border border-surface-container bg-surface-container-lowest shadow-[0_8px_24px_rgba(18,18,20,0.04)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_12px_30px_rgba(210,189,246,0.45)] group-focus-visible:ring-2 group-focus-visible:ring-primary">
        
        {/* Thumbnail Header */}
        <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-surface-container p-6">
          
          {course.thumbnail_url ? (
            /* Render Image if it exists */
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            /* Fallback Design (Unchanged) */
            <>
              {/* Subtle decorative radial glow & concentric rings using existing tokens */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border border-outline/10 transition-transform duration-500 group-hover:scale-125" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-surface-container-lowest/40 transition-transform duration-500 group-hover:scale-110" />

              {/* Monogram */}
              <span className="select-none text-6xl font-black tracking-widest text-outline/20 transition-all duration-300 group-hover:scale-110 group-hover:text-primary/25">
                {initials}
              </span>
            </>
          )}

          {/* Top-left Category Badge (Added z-10 to stay above image) */}
          {categoryName && (
            <span className="absolute left-4 top-4 z-10 rounded-full bg-secondary-container px-3.5 py-1 text-[11px] font-extrabold tracking-wide text-on-secondary-container shadow-sm">
              {categoryName}
            </span>
          )}

          {/* Bottom-right Level Pill (Added z-10 to stay above image) */}
          <span className="absolute bottom-3.5 right-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-surface-container-lowest/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {LEVEL_LABEL[course.level] ?? course.level}
          </span>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 flex-col p-6">
          <h3 className="line-clamp-2 text-[19px] font-extrabold leading-snug tracking-tight text-carbon transition-colors duration-200 group-hover:text-primary">
            {course.title}
          </h3>

          <p className="mt-2.5 line-clamp-2 flex-1 text-sm leading-relaxed text-on-surface-variant">
            {course.description}
          </p>

          {/* Footer / Price & Interactive CTA */}
          <div className="mt-6 flex items-center justify-between border-t border-surface-container pt-4">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-outline">
                Tuition
              </span>
              <span className="text-lg font-extrabold tracking-tight text-carbon">
                {formatCurrency(course.price_xaf)}
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-4 py-2 text-xs font-bold text-carbon transition-all duration-200 group-hover:bg-primary group-hover:text-surface-container-lowest">
              <span>Enroll now</span>
              <svg
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}