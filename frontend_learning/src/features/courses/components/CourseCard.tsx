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
    <Link to={`${resolvedBasePath}/${course.id}`} className="group block h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-1 group-hover:bg-white/10 group-hover:ring-white/20 group-hover:shadow-2xl group-hover:shadow-pastel-lilac/10">
        {/* Thumbnail */}
        <div className="relative flex aspect-[4/3] items-center justify-center bg-auth-bg p-6">
          <span className="text-5xl font-black tracking-widest text-white/5">
            {initials}
          </span>
          {categoryName && (
            <span className="absolute left-5 top-5 rounded-full bg-pastel-mint px-3 py-1 text-xs font-extrabold text-forest">
              {categoryName}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-pastel-lilac">
            {LEVEL_LABEL[course.level] ?? course.level}
          </div>
          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-white transition-colors group-hover:text-pastel-mint">
            {course.title}
          </h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm font-semibold text-gray-400">
            {course.description}
          </p>
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-xs font-bold text-gray-400">Enroll now</span>
            <span className="text-lg font-extrabold text-white">
              {formatCurrency(course.price_xaf)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}