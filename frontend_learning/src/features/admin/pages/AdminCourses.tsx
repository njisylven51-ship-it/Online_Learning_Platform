import { useCourseModeration } from '../hooks/useCourseModeration';
import { PageHeader } from '../../../components/common/PageHeader';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatCurrency';

export default function AdminCourses() {
  const { courses, loading, processing, review } = useCourseModeration();

  if (loading) return <LoadingState message="Loading pending courses…" />;

  return (
    <div className="space-y-6">
      <PageHeader title="Course Moderation" subtitle="Approve or reject courses submitted by teachers." />

      {courses.length === 0 ? (
        <EmptyState title="No pending courses" description="There are no courses awaiting review." />
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="rounded-xl border border-line bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-forest">{course.title}</h3>
                <p className="text-sm text-ink-muted line-clamp-1">{course.description}</p>
                <div className="mt-2 flex gap-2">
                  <Badge tone="info">{course.level}</Badge>
                  <Badge tone="neutral">{formatCurrency(course.price_xaf)}</Badge>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" onClick={() => review(course.id, false)} disabled={!!processing}>Reject</Button>
                <Button onClick={() => review(course.id, true)} disabled={!!processing}>Publish</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}