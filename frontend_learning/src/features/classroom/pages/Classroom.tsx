import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCourseContent } from '../hooks/useCourseContent';
import { useLesson } from '../hooks/useLesson';
import { useMyEnrolments } from '../../enrolments/hooks/useMyEnrolments';
import { useCourseDetails } from '../../courses/hooks/useCourseDetails';
import { CourseSidebar } from '../components/CourseSidebar';
import { LessonContent } from '../components/LessonContent';
import { LessonNavigation } from '../components/LessonNavigation';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { useAuth } from '../../../contexts/AuthContext';

export default function Classroom() {
  const { courseId = '' } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();

  const { data: enrollments, loading: enrolLoading } = useMyEnrolments();
  const { data: course } = useCourseDetails(courseId);
  const { modules, progress, loading: contentLoading, error: contentError, refetch } = useCourseContent(courseId);

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  const flatLessons = useMemo(() => modules?.flatMap((m) => m.lessons) ?? [], [modules]);

  useEffect(() => {
    if (flatLessons.length > 0 && !activeLessonId) setActiveLessonId(flatLessons[0].id);
  }, [flatLessons, activeLessonId]);

  useEffect(() => {
    if (!enrolLoading && enrollments) {
      const isEnrolled = enrollments.some((e) => e.course_id === courseId && e.is_active !== false);
      if (!isEnrolled) navigate(`/courses/${courseId}`, { replace: true });
    }
  }, [enrollments, enrolLoading, courseId, navigate]);

  const activeIndex = flatLessons.findIndex((l) => l.id === activeLessonId);
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex >= 0 && activeIndex < flatLessons.length - 1;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { lesson, resources, loading: lessonLoading, error: lessonError, refetch: refetchLesson } = useLesson(activeLessonId);

  if (enrolLoading || contentLoading) return <LoadingState message="Loading classroom…" />;
  if (contentError) return <ErrorState message={contentError} onRetry={refetch} />;
  if (!flatLessons.length) return <ErrorState message="This course has no lessons yet." />;

  const backLink = role === 'student' ? '/student/courses' : '/courses';

  return (
    // Added overflow-hidden to prevent the outer page from scrolling
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-surface md:p-2 lg:p-4">
      
      {/* Mobile Header */}
      <div className="flex items-center justify-between border-b border-surface-container bg-surface-container-lowest p-4 md:hidden">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-outline">Classroom</p>
          <p className="font-extrabold text-carbon truncate">{course?.title}</p>
        </div>
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="rounded-lg border border-surface-container bg-surface-container-lowest px-4 py-2 text-sm font-bold text-carbon shadow-sm"
        >
          Curriculum
        </button>
      </div>

      {/* UNIFIED CONTAINER */}
      <div className="flex flex-1 overflow-hidden bg-surface-container-lowest md:rounded-xl md:border md:border-surface-container md:shadow-[0_8px_24px_rgba(18,18,20,0.04)]">
        
        {/* Sidebar Desktop */}
        <div className="hidden w-80 shrink-0 border-r border-surface-container md:block">
          <div className="border-b border-surface-container p-6">
            <Link to={backLink} className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-on-primary-container transition">
              ← Back to courses
            </Link>
            <h2 className="mt-3 text-xl font-extrabold text-carbon">{course?.title}</h2>
          </div>
          <div className="h-[calc(100%-6rem)]">
            <CourseSidebar
              modules={modules ?? []}
              activeLessonId={activeLessonId ?? ''}
              onSelectLesson={setActiveLessonId}
              progress={progress}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <div className="mx-auto max-w-7xl p-6 sm:p-10">
            {lessonLoading && <LoadingState message="Loading lesson…" />}
            {lessonError && <ErrorState message={lessonError} />}
            
            {lesson && (
              <>
                <LessonContent
                  key={lesson.id}
                  lesson={lesson}
                  resources={resources}
                  onCompleted={() => refetch()}
                  onRefreshResources={refetchLesson}
                />
                <LessonNavigation
                  hasPrev={hasPrev}
                  hasNext={hasNext}
                  onPrev={() => setActiveLessonId(flatLessons[activeIndex - 1].id)}
                  onNext={() => setActiveLessonId(flatLessons[activeIndex + 1].id)}
                />
              </>
            )}
          </div>
        </main>

      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-carbon/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[80vw] bg-surface-container-lowest border-r border-surface-container">
            <div className="flex items-center justify-between border-b border-surface-container p-5">
              <span className="font-extrabold text-carbon">Curriculum</span>
              <button onClick={() => setSidebarOpen(false)} className="text-outline hover:text-carbon">✕</button>
            </div>
            <div className="h-[calc(100%-4rem)] overflow-y-auto no-scrollbar">
              <CourseSidebar
                modules={modules ?? []}
                activeLessonId={activeLessonId ?? ''}
                onSelectLesson={(id) => { setActiveLessonId(id); setSidebarOpen(false); }}
                progress={progress}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}