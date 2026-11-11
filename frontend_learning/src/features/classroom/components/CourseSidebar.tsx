import { NavLink } from 'react-router-dom';
import type { ModuleWithLessons } from '../hooks/useCourseContent';
import type { CourseProgress } from '../types';

interface CourseSidebarProps {
  modules: ModuleWithLessons[];
  activeLessonId: string;
  onSelectLesson: (id: string) => void;
  progress: CourseProgress | null;
}

export function CourseSidebar({ modules, activeLessonId, onSelectLesson, progress }: CourseSidebarProps) {
  return (
    <div className="flex h-full flex-col bg-white">
      {/* Progress Header */}
      {progress && (
        <div className="border-b border-line p-4">
          <div className="flex items-center justify-between text-xs font-medium text-forest">
            <span>Course Progress</span>
            <span>{Math.round(progress.percentage)}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-forest-tint">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            {progress.completed_lessons} of {progress.total_lessons} lessons completed
          </p>
        </div>
      )}

      {/* Curriculum */}
      <div className="flex-1 overflow-y-auto p-2">
        {modules.map((mod) => (
          <div key={mod.id} className="mb-4">
            <h3 className="mb-1 px-3 text-xs font-bold uppercase tracking-wider text-ink-subtle">
              {mod.title}
            </h3>
            <ul className="space-y-0.5">
              {mod.lessons.map((lesson) => {
                const isActive = lesson.id === activeLessonId;
                return (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      onClick={() => onSelectLesson(lesson.id)}
                      className={[
                        'flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm transition',
                        isActive
                          ? 'bg-accent-tint font-medium text-forest'
                          : 'text-ink-muted hover:bg-forest-tint hover:text-forest',
                      ].join(' ')}
                    >
                      <span className={['mt-0.5 shrink-0', isActive ? 'text-accent' : 'text-ink-subtle'].join(' ')}>
                        {isActive ? (
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        ) : (
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                        )}
                      </span>
                      <span className="flex-1">{lesson.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}