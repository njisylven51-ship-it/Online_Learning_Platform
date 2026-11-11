import { Link } from 'react-router-dom';
import { useStudentDashboard } from '../../student/hooks/useStudentDashboard';
import { useCertificates } from '../hooks/useCertificates';
import { certificateService } from '../services/certificateService';
import { PageHeader } from '../../../components/common/PageHeader';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../utils/formatDate';

export default function CertificatesPage() {
  const { courses } = useStudentDashboard();
  const { data: certs, loading, error, generate, generating } = useCertificates();

  if (loading) return <LoadingState message="Loading certificates…" />;
  if (error) return <ErrorState message={error} />;

  // Find courses that are 100% complete but don't have a cert yet
  const eligibleCourses = courses?.filter(c => 
    c.progress?.percentage === 100 && 
    !certs?.some(cert => cert.course_id === c.course.id)
  ) || [];

  const hasCerts = certs && certs.length > 0;
  const hasEligible = eligibleCourses.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Certificates" 
        subtitle="View and download your earned certificates." 
      />

      {!hasCerts && !hasEligible ? (
        <EmptyState
          title="No certificates yet"
          description="Complete a course to 100% to earn your first certificate!"
          action={<Link to="/student/progress"><Button>View Progress</Button></Link>}
        />
      ) : (
        <div className="space-y-8">
          
          {/* Eligible to Claim */}
          {hasEligible && (
            <section>
              <h2 className="mb-4 text-lg font-bold text-forest">Claim Your Certificates</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {eligibleCourses.map(c => (
                  <div key={c.course.id} className="flex flex-col justify-between rounded-xl border border-accent bg-accent-tint p-5">
                    <div>
                      <h3 className="font-bold text-forest">{c.course.title}</h3>
                      <p className="mt-1 text-sm text-ink-muted">You have completed this course!</p>
                    </div>
                    <Button 
                      className="mt-4 w-full" 
                      onClick={() => generate(c.course.id)}
                      disabled={generating === c.course.id}
                    >
                      {generating === c.course.id ? 'Generating…' : 'Claim Certificate'}
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Earned Certificates */}
          {hasCerts && (
            <section>
              <h2 className="mb-4 text-lg font-bold text-forest">Earned Certificates</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {certs.map(cert => (
                  <div key={cert.id} className="rounded-xl border border-line bg-white p-6 shadow-sm">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-forest">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                    </div>
                    <h3 className="font-bold text-forest">{cert.course_title ?? 'Course Certificate'}</h3>
                    <p className="mt-1 text-xs text-ink-muted">Issued on {formatDate(cert.issued_at)}</p>
                    
                    <a 
                      href={certificateService.getPdfUrl(cert.id)} 
                      target="_blank" 
                      rel="noreferrer"
                      className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-line bg-white py-2 text-sm font-medium text-forest hover:bg-forest-tint"
                    >
                      Download PDF ↗
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}