import { useCourseModeration } from '../hooks/useCourseModeration';
import { PageHeader } from '../../../components/common/PageHeader';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatCurrency';

export default function AdminCourses() {
  const { courses, loading, error, processing, review } = useCourseModeration();

  if (loading) return <LoadingState message="Loading pending courses…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="mx-auto space-y-8 pb-8">
      <PageHeader 
        title="Course Moderation" 
        subtitle="Approve or reject courses submitted by teachers." 
      />

      {courses.length === 0 ? (
        // Blended Empty State with colored icon
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-primary">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-carbon">No pending courses</h3>
          <p className="mt-2 text-on-surface-variant">There are no courses awaiting review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="flex flex-col justify-between gap-6 rounded-xl border border-surface-container bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(18,18,20,0.04)] sm:flex-row sm:items-center">
              
              {/* Course Info & Thumbnail */}
              <div className="flex flex-1 items-start gap-5">
                <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-outline">
                      No Cover
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-carbon">{course.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm font-medium text-on-surface-variant">{course.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-surface-container px-2.5 py-0.5 text-xs font-bold text-on-surface-variant capitalize">{course.level}</span>
                    <span className="rounded-lg bg-primary-container px-2.5 py-0.5 text-xs font-bold text-on-primary-container">{formatCurrency(course.price_xaf)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 gap-3 border-t border-surface-container pt-4 sm:border-t-0 sm:pt-0">
                <Button 
                  className="rounded-lg bg-error-container text-on-error-container hover:bg-error-container/80 font-bold px-6" 
                  onClick={() => review(course.id, false)} 
                  disabled={!!processing}
                >
                  Reject
                </Button>
                <Button 
                  className="rounded-lg bg-carbon text-white hover:bg-carbon-light font-bold px-8" 
                  onClick={() => review(course.id, true)} 
                  disabled={!!processing}
                >
                  {processing === course.id ? '...' : 'Publish'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}