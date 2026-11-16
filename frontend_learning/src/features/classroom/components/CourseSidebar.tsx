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
    <div className="flex h-full flex-col bg-surface-container-lowest">
      {progress && (
        <div className="border-b border-surface-container p-6">
          <div className="flex items-center justify-between text-xs font-bold text-carbon">
            <span>Course Progress</span>
            <span className="text-primary">{Math.round(progress.percentage)}%</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-container">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress.percentage}%` }} />
          </div>
          <p className="mt-3 text-xs font-medium text-on-surface-variant">
            {progress.completed_lessons} of {progress.total_lessons} lessons completed
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {modules.map((mod) => (
          <div key={mod.id} className="mb-6">
            <h3 className="mb-2 px-3 text-xs font-extrabold uppercase tracking-wider text-outline">
              {mod.title}
            </h3>
            <ul className="space-y-1">
              {mod.lessons.map((lesson) => {
                const isActive = lesson.id === activeLessonId;
                return (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      onClick={() => onSelectLesson(lesson.id)}
                      className={[
                        'flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition-all',
                        isActive
                          ? 'bg-primary-container text-on-primary-container shadow-sm'
                          : 'text-on-surface-variant hover:bg-surface-container hover:text-carbon',
                      ].join(' ')}
                    >
                      <span className={['mt-0.5 shrink-0', isActive ? 'text-on-primary-container' : 'text-outline'].join(' ')}>
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