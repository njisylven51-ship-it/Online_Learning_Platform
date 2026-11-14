import { useInstructorApplications } from '../hooks/useInstructorApplications';
import { PageHeader } from '../../../components/common/PageHeader';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../utils/formatDate';

export default function AdminInstructors() {
  const { apps, loading, processing, review } = useInstructorApplications();

  if (loading) return <LoadingState message="Loading applications…" />;

  return (
    <div className="space-y-6">
      <PageHeader title="Instructor Applications" subtitle="Review and approve pending teacher registrations." />

      {apps.length === 0 ? (
        <EmptyState title="No pending applications" description="All teacher applications have been reviewed." />
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <div key={app.id} className="rounded-xl border border-line bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-bold text-forest">{app.full_name}</h3>
                  <p className="text-sm text-ink-muted">{app.email} · Applied {formatDate(app.created_at)}</p>
                  <div className="mt-3 space-y-2 text-sm">
                    <p><span className="font-semibold text-forest">Bio:</span> {app.bio}</p>
                    <p><span className="font-semibold text-forest">Qualifications:</span> {app.qualifications}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="secondary" onClick={() => review(app.id, false)} disabled={!!processing}>
                    {processing === app.id ? '…' : 'Reject'}
                  </Button>
                  <Button onClick={() => review(app.id, true)} disabled={!!processing}>
                    {processing === app.id ? '…' : 'Approve'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}