import { useInstructorApplications } from '../hooks/useInstructorApplications';
import { PageHeader } from '../../../components/common/PageHeader';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../utils/formatDate';

export default function AdminInstructors() {
  const { apps, loading, processing, review } = useInstructorApplications();

  if (loading) return <LoadingState message="Loading applications…" />;

  return (
    <div className="mx-auto space-y-8 pb-8">
      <PageHeader 
        title="Instructor Applications" 
        subtitle="Review and approve pending teacher registrations." 
      />

      {apps.length === 0 ? (
        // Blended Empty State with colored icon
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-primary">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-carbon">No pending applications</h3>
          <p className="mt-2 text-on-surface-variant">All teacher applications have been reviewed.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {apps.map((app) => (
            <div 
              key={app.id} 
              className="flex flex-col justify-between rounded-xl border border-surface-container bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(18,18,20,0.04)]"
            >
              {/* Header & Actions */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-surface-container pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-carbon">{app.full_name}</h3>
                  <p className="text-sm font-medium text-on-surface-variant">{app.email}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-outline">
                    Applied {formatDate(app.created_at)}
                  </p>
                </div>
                
                <div className="flex shrink-0 gap-2">
                  <Button 
                    size="sm" 
                    className="rounded-lg bg-error-container text-on-error-container hover:bg-error-container/80 font-bold" 
                    onClick={() => review(app.id, false)} 
                    disabled={!!processing}
                  >
                    {processing === app.id ? '...' : 'Reject'}
                  </Button>
                  <Button 
                    size="sm" 
                    className="rounded-lg bg-carbon text-white hover:bg-carbon-light font-bold" 
                    onClick={() => review(app.id, true)} 
                    disabled={!!processing}
                  >
                    {processing === app.id ? '...' : 'Approve'}
                  </Button>
                </div>
              </div>

              {/* Details */}
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-outline">
                    Biography
                  </span>
                  <p className="font-medium text-carbon">{app.bio}</p>
                </div>
                <div>
                  <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-outline">
                    Qualifications
                  </span>
                  <p className="font-medium text-carbon">{app.qualifications}</p>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}