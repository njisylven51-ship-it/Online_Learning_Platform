import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMyCourses } from '../hooks/useMyCourses';
import { courseService } from '../../courses/services/courseService';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LessonManager } from '../components/LessonManager';
import { ThumbnailUploader } from '../../courses/components/ThumbnailUploader';

const STATUS_META: Record<string, { badge: string; dot: string; label: string }> = {
  published: {
    badge: 'bg-secondary-container text-on-secondary-container border-secondary/30',
    dot: 'bg-secondary',
    label: 'Published',
  },
  pending_review: {
    badge: 'bg-tertiary-container text-on-tertiary-container border-tertiary/30',
    dot: 'bg-tertiary animate-pulse',
    label: 'Pending Review',
  },
  rejected: {
    badge: 'bg-error-container text-on-error-container border-error/30',
    dot: 'bg-error',
    label: 'Rejected',
  },
  draft: {
    badge: 'bg-surface-container text-on-surface-variant border-outline-variant/30',
    dot: 'bg-outline',
    label: 'Draft',
  },
};

export default function EditCourse() {
  const { courseId = '' } = useParams<{ courseId: string }>();

  const { data: myCourses, loading: coursesLoading, refetch: refetchCourses } = useMyCourses();
  const course = myCourses?.find((c) => c.id === courseId);

  const [modules, setModules] = useState<any[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isAddingModule, setIsAddingModule] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');
  const [creatingModule, setCreatingModule] = useState(false);

  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchModules = useCallback(async () => {
    try {
      const data = await courseService.getModules(courseId);
      const sorted = data.sort((a, b) => a.position - b.position);
      setModules(sorted);
      if (sorted.length > 0 && !activeModuleId) setActiveModuleId(sorted[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingModules(false);
    }
  }, [courseId, activeModuleId]);

  useEffect(() => {
    void fetchModules();
  }, [fetchModules]);

  async function handleAddModule(e: FormEvent) {
    e.preventDefault();
    setCreatingModule(true);
    try {
      const newMod = await courseService.createModule(courseId, {
        title: moduleTitle.trim(),
        description: moduleDesc.trim(),
        position: modules.length,
      });
      setModuleTitle('');
      setModuleDesc('');
      setIsAddingModule(false);
      await fetchModules();
      setActiveModuleId(newMod.id);
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingModule(false);
    }
  }

  async function handleSubmitForReview() {
    setSubmitting(true);
    try {
      await courseService.submitForReview(courseId);
      await refetchCourses();
      alert('Course submitted for review successfully!');
    } catch {
      alert('Failed to submit course. Make sure it has at least one lesson.');
    } finally {
      setSubmitting(false);
    }
  }

  if (coursesLoading) return <LoadingState message="Loading course studio…" />;
  if (!course) return <ErrorState message="Course not found in your list." />;

  const statusMeta = STATUS_META[course.status] ?? STATUS_META.draft;
  const activeModule = modules.find((m) => m.id === activeModuleId);
  const activeIndex = modules.findIndex((m) => m.id === activeModuleId);
  const canSubmit = course.status === 'draft' || course.status === 'rejected';

  const renderModuleNavigation = (closeDrawer?: () => void) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-outline">
            Curriculum
          </h3>
          <span className="rounded-full bg-primary-container/70 px-2 py-0.5 text-[11px] font-extrabold text-primary">
            {modules.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsAddingModule(true);
            closeDrawer?.();
          }}
          className="inline-flex items-center gap-1 rounded-full bg-primary-container/50 px-3 py-1 text-xs font-extrabold text-primary transition hover:bg-primary-container"
        >
          <span>+ Module</span>
        </button>
      </div>

      {loadingModules ? (
        <div className="space-y-2 px-1">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-14 animate-pulse rounded-xl bg-surface-container" />
          ))}
        </div>
      ) : modules.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-primary/25 bg-primary-container/10 p-5 text-center">
          <p className="text-xs font-bold text-slate-700">No modules yet</p>
          <p className="mt-1 text-[11px] font-medium text-slate-500">
            Create your first chapter to begin adding lessons.
          </p>
          <Button
            type="button"
            onClick={() => {
              setIsAddingModule(true);
              closeDrawer?.();
            }}
            className="mt-4 w-full rounded-full bg-primary py-2 text-xs font-extrabold text-white shadow-sm hover:bg-primary/90"
          >
            + Create First Module
          </Button>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {modules.map((mod, index) => {
            const isSelected = mod.id === activeModuleId && !isAddingModule;
            return (
              <li key={mod.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModuleId(mod.id);
                    setIsAddingModule(false);
                    closeDrawer?.();
                  }}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'text-on-surface-variant hover:bg-primary-container/25 hover:text-carbon'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold transition-colors ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-surface-container text-outline group-hover:bg-primary-container group-hover:text-primary'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{mod.title}</p>
                    {mod.description && (
                      <p
                        className={`truncate text-[11px] ${
                          isSelected ? 'text-white/80' : 'text-outline'
                        }`}
                      >
                        {mod.description}
                      </p>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden bg-surface">
      {/* Top Studio Header Bar */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-surface-container bg-surface-container-lowest px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          {/* Mobile Curriculum Drawer Button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open curriculum menu"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-surface-container bg-white text-carbon transition hover:bg-surface-container md:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <Link
            to="/teacher/courses"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-surface-container bg-surface-container px-3.5 py-1.5 text-xs font-bold text-on-surface-variant transition hover:border-primary/30 hover:bg-primary-container/25 hover:text-primary"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span className="hidden sm:inline">My Courses</span>
          </Link>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="truncate text-base font-extrabold text-carbon sm:text-lg">
                {course.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2.5">
          {canSubmit && (
            <Button
              type="button"
              onClick={handleSubmitForReview}
              disabled={submitting || modules.length === 0}
              className="rounded-full bg-primary px-5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50 sm:text-sm"
            >
              {submitting ? 'Submitting…' : 'Submit for Review'}
            </Button>
          )}
        </div>
      </header>

      {/* Main Split Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Curriculum Sidebar */}
        <aside className="hidden w-80 shrink-0 flex-col border-r border-surface-container bg-surface-container-lowest md:flex">
          <div className="flex-1 overflow-y-auto p-4">{renderModuleNavigation()}</div>

          <div className="border-t border-surface-container bg-surface-container/50 px-5 py-3.5">
            <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
              <span>Course Chapters</span>
              <span className="font-extrabold text-carbon">{modules.length}</span>
            </div>
          </div>
        </aside>

        {/* Full-Width Editor Canvas */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-6 sm:p-8 lg:p-10">
            
            {/* TOP SECTION: COURSE PREVIEW & THUMBNAIL */}
            <div className="mb-8 rounded-2xl border border-surface-container bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(18,18,20,0.03)] sm:p-8">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant">
                  Live Catalog Preview
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusMeta.badge}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                  {statusMeta.label}
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-[240px_1fr] sm:items-start">
                {/* Thumbnail Uploader */}
                <div className="w-full">
                  <ThumbnailUploader
                    courseId={course.id}
                    currentUrl={course.thumbnail_url}
                    onUpdate={() => refetchCourses()}
                  />
                </div>

                {/* Course Details */}
                <div className="space-y-3">
                  <h2 className="text-2xl font-extrabold leading-tight text-carbon">
                    {course.title}
                  </h2>
                  <p className="line-clamp-3 text-sm leading-relaxed text-on-surface-variant">
                    {course.description || 'No description provided.'}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-extrabold capitalize text-on-surface-variant">
                      {course.level}
                    </span>
                    <span className="text-sm font-black text-carbon">
                      {course.price_xaf === 0 ? 'Free' : `${course.price_xaf.toLocaleString()} XAF`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 1. ADD MODULE FORM */}
            {isAddingModule ? (
              <div className="w-full space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/15 bg-white p-6 shadow-[0_8px_24px_rgba(99,102,241,0.05)] sm:p-8">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary">
                        Chapter #{modules.length + 1}
                      </span>
                      <h2 className="text-2xl font-extrabold text-carbon">Add New Module</h2>
                      <p className="mt-1 text-sm font-medium text-on-surface-variant">
                        Modules organize your course into logical chapters. You will add lessons inside them next.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsAddingModule(false)}
                    className="rounded-full px-5 font-bold text-on-surface-variant hover:bg-surface-container"
                  >
                    Cancel
                  </Button>
                </div>

                <form
                  onSubmit={handleAddModule}
                  className="space-y-6 rounded-xl border border-primary/15 bg-white p-6 shadow-[0_8px_24px_rgba(99,102,241,0.05)] sm:p-8"
                >
                  <Input
                    label="Module Title"
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    required
                    disabled={creatingModule}
                    placeholder="e.g. Introduction to Python"
                  />
                  <Textarea
                    label="Module Description"
                    value={moduleDesc}
                    onChange={(e) => setModuleDesc(e.target.value)}
                    rows={4}
                    required
                    disabled={creatingModule}
                    placeholder="What will students learn in this module?"
                  />
                  <div className="flex flex-col-reverse justify-end gap-3 border-t border-surface-container pt-6 sm:flex-row">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsAddingModule(false)}
                      disabled={creatingModule}
                      className="rounded-full px-6 font-bold text-on-surface-variant hover:bg-surface-container"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={creatingModule || !moduleTitle.trim()}
                      className="rounded-full bg-primary px-8 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
                    >
                      {creatingModule ? 'Saving Module…' : 'Save Module'}
                    </Button>
                  </div>
                </form>
              </div>
            ) : activeModule ? (
              /* 2. ACTIVE MODULE & LESSON MANAGER */
              <div className="w-full space-y-6">
                <div className="flex flex-col justify-between gap-4 rounded-xl border border-surface-container bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(18,18,20,0.03)] sm:flex-row sm:items-center sm:p-8">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary-container/60 px-3 py-0.5 text-xs font-extrabold text-primary">
                      Module {activeIndex + 1} of {modules.length}
                    </div>
                    <h2 className="text-2xl font-extrabold text-carbon">{activeModule.title}</h2>
                    {activeModule.description && (
                      <p className="text-sm font-medium text-on-surface-variant">{activeModule.description}</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={() => setIsAddingModule(true)}
                    className="shrink-0 rounded-full border border-primary/25 bg-primary-container/25 px-5 py-2 text-xs font-extrabold text-primary transition hover:bg-primary-container/50"
                  >
                    + New Module
                  </Button>
                </div>

                <div className="rounded-xl border border-surface-container bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(18,18,20,0.03)] sm:p-8">
                  <LessonManager moduleId={activeModule.id} />
                </div>
              </div>
            ) : (
              /* 3. EMPTY STATES */
              <div className="flex min-h-[460px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/25 bg-surface-container-lowest p-10 text-center">
                {modules.length === 0 ? (
                  <>
                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-container text-primary shadow-sm">
                      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-extrabold text-carbon">Start building your course</h3>
                    <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-on-surface-variant">
                      Your course is currently empty. Create your first module to start adding lessons, videos, and quizzes.
                    </p>
                    <Button
                      type="button"
                      onClick={() => setIsAddingModule(true)}
                      className="mt-7 rounded-full bg-primary px-8 py-3 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90"
                    >
                      + Create Your First Module
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary-container text-secondary shadow-sm">
                      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-extrabold text-carbon">Select a module</h3>
                    <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-on-surface-variant">
                      Choose a module from the sidebar to start managing its lessons, or create a brand new module.
                    </p>
                    <Button
                      type="button"
                      onClick={() => setIsAddingModule(true)}
                      className="mt-7 rounded-full bg-primary px-8 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-primary/90"
                    >
                      + Add New Module
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Curriculum Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-carbon/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col border-r border-surface-container bg-surface-container-lowest shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-container p-5">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-primary">
                  Course Studio
                </p>
                <p className="truncate font-extrabold text-carbon">{course.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
                className="rounded-full border border-surface-container p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-carbon"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {renderModuleNavigation(() => setSidebarOpen(false))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}