import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMyCourses } from '../hooks/useMyCourses'; // <-- Changed import
import { courseService } from '../../courses/services/courseService';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LessonManager } from '../components/LessonManager';

export default function EditCourse() {
  const { courseId = '' } = useParams<{ courseId: string }>();
  
  // Use useMyCourses instead of public useCourseDetails
  const { data: myCourses, loading: coursesLoading, refetch: refetchCourses } = useMyCourses();
  const course = myCourses?.find((c) => c.id === courseId);
  
  const [modules, setModules] = useState<any[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Module Form State
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');
  const [creatingModule, setCreatingModule] = useState(false);

  // Expanded Module Tracking
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    try {
      const data = await courseService.getModules(courseId);
      setModules(data.sort((a, b) => a.position - b.position));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingModules(false);
    }
  }, [courseId]);

  useEffect(() => { 
    void fetchModules(); 
  }, [fetchModules]);

  async function handleAddModule(e: FormEvent) {
    e.preventDefault();
    setCreatingModule(true);
    try {
      await courseService.createModule(courseId, {
        title: moduleTitle,
        description: moduleDesc,
        position: modules.length,
      });
      setModuleTitle('');
      setModuleDesc('');
      setIsAddingModule(false);
      await fetchModules();
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
      await refetchCourses(); // Refresh the list to get updated status
      alert('Course submitted for review successfully!');
    } catch (err) {
      alert('Failed to submit course. Make sure it has at least one lesson.');
    } finally {
      setSubmitting(false);
    }
  }

  if (coursesLoading) return <LoadingState message="Loading course…" />;
  if (!course) return <ErrorState message="Course not found in your list. It may have been deleted." />;

  const statusTone = 
    course.status === 'published' ? 'success' :
    course.status === 'pending_review' ? 'warning' :
    course.status === 'rejected' ? 'danger' : 'neutral';

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/teacher/courses" className="text-sm font-medium text-accent hover:underline">
            ← Back to My Courses
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-forest md:text-3xl">{course.title}</h1>
          <div className="mt-2 flex items-center gap-3">
            <Badge tone={statusTone}>{course.status.replace('_', ' ').toUpperCase()}</Badge>
            <span className="text-sm text-ink-muted">{modules.length} Modules</span>
          </div>
        </div>
        
        {course.status === 'draft' || course.status === 'rejected' ? (
          <Button onClick={handleSubmitForReview} disabled={submitting || modules.length === 0}>
            {submitting ? 'Submitting…' : 'Submit for Review'}
          </Button>
        ) : null}
      </div>

      {course.status === 'rejected' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          This course was rejected. You can make changes and resubmit it.
        </div>
      )}

      {/* Curriculum Builder */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-forest">Curriculum</h2>
          {!isAddingModule && (
            <Button variant="secondary" size="sm" onClick={() => setIsAddingModule(true)}>
              + Add Module
            </Button>
          )}
        </div>

        {isAddingModule && (
          <form onSubmit={handleAddModule} className="rounded-xl border border-accent bg-accent-tint p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-forest">New Module</h3>
            <div className="space-y-4">
              <Input
                label="Module Title"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="e.g. Getting Started with Python"
                required
              />
              <Textarea
                label="Module Description"
                value={moduleDesc}
                onChange={(e) => setModuleDesc(e.target.value)}
                rows={2}
                required
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsAddingModule(false)}>Cancel</Button>
                <Button type="submit" disabled={creatingModule}>Save Module</Button>
              </div>
            </div>
          </form>
        )}

        {loadingModules ? (
          <LoadingState message="Loading curriculum…" />
        ) : modules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-forest-tint p-8 text-center text-sm text-ink-muted">
            No modules yet. Add your first module to start building the course.
          </div>
        ) : (
          <div className="space-y-3">
            {modules.map((mod) => {
              const isExpanded = expandedModuleId === mod.id;
              return (
                <div key={mod.id} className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
                  <div 
                    className="flex cursor-pointer items-center justify-between p-4 hover:bg-forest-tint/50"
                    onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                  >
                    <div>
                      <h3 className="font-bold text-forest">{mod.title}</h3>
                      <p className="text-sm text-ink-muted">{mod.description}</p>
                    </div>
                    <Button variant={isExpanded ? 'primary' : 'secondary'} size="sm">
                      {isExpanded ? 'Close' : 'Manage Lessons'}
                    </Button>
                  </div>
                  
                  {/* Expanded Area */}
                  {isExpanded && (
                    <div className="border-t border-line bg-white p-4">
                      <LessonManager moduleId={mod.id} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}