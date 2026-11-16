import { Link } from 'react-router-dom';
import type { EnrolledCourse } from '../types';

export function MyCourseCard({ data }: { data: EnrolledCourse }) {
  const { course, progress } = data;
  const pct = Math.min(100, Math.max(0, progress?.percentage ?? 0));
  const isCompleted = pct === 100;

  return (
    <Link 
      to={`/student/classroom/${course.id}`} 
      className="group block h-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1 "
    >
      <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_10px_30px_rgba(18,18,20,0.04)] transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_18px_40px_rgba(210,189,246,0.35)]">
        
        {/* Media / Thumbnail Header */}
        <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-surface-container to-secondary-container/20">
          
          {/* Decorative soft backdrop badge */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* Play / Media Button Badge */}
          <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-lowest/90 text-primary shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
            <svg className="h-6 w-6 translate-x-0.5 fill-current" viewBox="0 0 24 24">
              <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z" />
            </svg>
          </div>

          {/* Status Badge */}
          {isCompleted ? (
            <div className="absolute right-4 top-4 z-10 rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container shadow-sm">
              Completed
            </div>
          ) : (
            <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-surface-container-lowest/90 px-3 py-1 text-xs font-bold text-primary shadow-sm backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>{pct > 0 ? 'Keep Watching' : 'Ready'}</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex flex-1 flex-col p-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-outline mb-1.5">
            {course.slug}
          </div>
          
          <h3 className="line-clamp-2 text-lg font-extrabold tracking-tight text-carbon transition-colors group-hover:text-primary">
            {course.title}
          </h3>

          <div className="mt-auto pt-6">
            <div className="mb-2 flex items-center justify-between text-xs font-bold">
              <span className="text-on-surface-variant">Progress</span>
              <span className="text-primary">{pct}%</span>
            </div>
            
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-container">
              <div 
                className="h-full rounded-full bg-primary transition-all duration-700 ease-out" 
                style={{ width: `${pct}%` }} 
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}