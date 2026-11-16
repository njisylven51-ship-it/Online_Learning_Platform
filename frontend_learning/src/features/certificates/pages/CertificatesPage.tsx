import { Link } from 'react-router-dom';
import { useStudentDashboard } from '../../student/hooks/useStudentDashboard';
import { useCertificates } from '../hooks/useCertificates';
import { PageHeader } from '../../../components/common/PageHeader';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../utils/formatDate';
import { session } from '../../../services/storage/session';
import { env } from '../../../config/env';

export default function CertificatesPage() {
  const { courses } = useStudentDashboard();
  const { data: certs, loading, error, generate, generating } = useCertificates();

  async function handleDownload(certId: string, courseTitle: string) {
    try {
      const token = session.getToken();
      const res = await fetch(`${env.apiBaseUrl}/certificates/${certId}/pdf`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) throw new Error('Failed to download');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url; 
      a.download = `Certificate-${courseTitle.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a); 
      a.click(); 
      a.remove();
      
      window.URL.revokeObjectURL(url);
    } catch (e) { 
      alert('Could not download certificate.'); 
    }
  }

  if (loading) return <LoadingState message="Loading certificates…" />;
  if (error) return <ErrorState message={error} />;

  const eligibleCourses = courses?.filter(c => c.progress?.percentage === 100 && !certs?.some(cert => cert.course_id === c.course.id)) || [];
  const hasCerts = certs && certs.length > 0;
  const hasEligible = eligibleCourses.length > 0;

  return (
    <div className="space-y-10 pb-8">
      <PageHeader 
        title="My Certificates" 
        subtitle="View and download your earned certificates." 
      />

      {!hasCerts && !hasEligible ? (
        // --- EMPTY STATE ---
        <div className="rounded-xl border border-surface-container bg-surface-container-lowest p-12 text-center shadow-[0_8px_24px_rgba(18,18,20,0.04)]">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container text-outline">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-carbon">No certificates yet</h3>
          <p className="mt-2 text-on-surface-variant">Complete a course to 100% to earn your first certificate!</p>
          <div className="mt-6">
            <Link to="/student/progress">
              <Button className="rounded-full bg-carbon text-white font-bold hover:bg-carbon-light px-8 py-3">View Progress</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* --- CLAIMABLE CERTIFICATES (Lilac Theme) --- */}
          {hasEligible && (
            <section>
              <h2 className="mb-6 text-2xl font-extrabold text-carbon">Claim Your Certificates</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {eligibleCourses.map(c => (
                  <div key={c.course.id} className="flex flex-col h-full justify-between rounded-xl bg-primary-container p-10 shadow-[0_12px_30px_rgba(210,189,246,0.45)] transition hover:-translate-y-1">
                    <div>
                      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-white/40 text-on-primary-container">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                      </div>
                      <h3 className="text-xl font-bold text-on-primary-container line-clamp-2">{c.course.title}</h3>
                      <p className="mt-3 text-sm font-semibold text-on-primary-container/80">You have completed this course!</p>
                    </div>
                    <Button 
                      className="mt-10 w-full rounded-full bg-carbon text-white font-extrabold hover:bg-carbon-light py-3.5" 
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

          {/* --- EARNED CERTIFICATES (White Cards + Mint) --- */}
          {hasCerts && (
            <section>
              <h2 className="mb-6 text-2xl font-extrabold text-carbon">Earned Certificates</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {certs.map(cert => (
                  <div key={cert.id} className="flex flex-col h-full min-h-[280px] justify-between rounded-xl border border-surface-container bg-surface-container-lowest p-10 shadow-[0_8px_24px_rgba(18,18,20,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(184,236,199,0.45)]">
                    <div>
                      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                      </div>
                      <h3 className="text-lg font-bold text-carbon line-clamp-2">{cert.course_title ?? 'Course Certificate'}</h3>
                      <p className="mt-2 text-xs font-bold text-on-surface-variant">Issued on {formatDate(cert.issued_at)}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleDownload(cert.id, cert.course_title ?? 'Course')} 
                      className="mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-surface-container bg-surface-container-lowest py-3.5 text-sm font-bold text-carbon transition hover:bg-surface-container"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download PDF
                    </button>
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