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

  // Flatten lessons for navigation
  const flatLessons = useMemo(() => {
    return modules?.flatMap((m) => m.lessons) ?? [];
  }, [modules]);

  // Set initial active lesson
  useEffect(() => {
    if (flatLessons.length > 0 && !activeLessonId) {
      setActiveLessonId(flatLessons[0].id);
    }
  }, [flatLessons, activeLessonId]);

  // Redirect if not enrolled
  useEffect(() => {
    if (!enrolLoading && enrollments) {
      // FIXED: If is_active is missing, assume it is true. Only kick them out if it is explicitly false.
      const isEnrolled = enrollments.some((e) => e.course_id === courseId && e.is_active !== false);
      if (!isEnrolled) {
        navigate(`/courses/${courseId}`, { replace: true });
      }
    }
  }, [enrollments, enrolLoading, courseId, navigate]);

  const activeIndex = flatLessons.findIndex((l) => l.id === activeLessonId);
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex >= 0 && activeIndex < flatLessons.length - 1;

  // Mobile drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // FIXED: Extract refetch as refetchLesson so we can pass it down to refresh signed URLs
  const { lesson, resources, loading: lessonLoading, error: lessonError, refetch: refetchLesson } = useLesson(activeLessonId);

  if (enrolLoading || contentLoading) return <LoadingState message="Loading classroom…" />;
  if (contentError) return <ErrorState message={contentError} onRetry={refetch} />;
  if (!flatLessons.length) return <ErrorState message="This course has no lessons yet." />;

  // Determine the back link based on the user's role
  const backLink = role === 'student' ? '/student/courses' : '/courses';

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col md:flex-row bg-white">
      {/* Mobile Header / Sidebar Toggle */}
      <div className="flex items-center justify-between border-b border-line bg-white p-4 md:hidden">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">Classroom</p>
          <p className="font-semibold text-forest truncate">{course?.title}</p>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-md border border-line p-2 text-sm font-medium text-forest shadow-sm"
        >
          Curriculum
        </button>
      </div>

      {/* Sidebar Desktop */}
      <div className="hidden w-80 shrink-0 border-r border-line md:block">
        <div className="border-b border-line p-4">
          <Link to={backLink} className="text-xs font-medium text-accent hover:underline">
            ← Back to courses
          </Link>
          <h2 className="mt-2 text-lg font-bold text-forest">{course?.title}</h2>
        </div>
        <div className="h-[calc(100%-5rem)]">
          <CourseSidebar
            modules={modules ?? []}
            activeLessonId={activeLessonId ?? ''}
            onSelectLesson={setActiveLessonId}
            progress={progress}
          />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-forest/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[80vw] bg-white">
            <div className="flex items-center justify-between border-b border-line p-4">
              <span className="font-bold text-forest">Curriculum</span>
              <button onClick={() => setSidebarOpen(false)} className="text-ink-muted">✕</button>
            </div>
            <div className="h-[calc(100%-3.5rem)]">
              <CourseSidebar
                modules={modules ?? []}
                activeLessonId={activeLessonId ?? ''}
                onSelectLesson={(id) => {
                  setActiveLessonId(id);
                  setSidebarOpen(false);
                }}
                progress={progress}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          {lessonLoading && <LoadingState message="Loading lesson…" />}
          {lessonError && <ErrorState message={lessonError} />}
          
          {lesson && (
            <>
              <LessonContent
                key={lesson.id}
                lesson={lesson}
                resources={resources}
                onCompleted={() => refetch()}
                onRefreshResources={refetchLesson}  // <-- ADDED: Pass refetch to LessonContent
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
  );
}