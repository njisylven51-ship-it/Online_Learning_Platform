import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useProfile } from '../../user/hooks/useProfile';
import { PageHeader } from '../../../components/common/PageHeader';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export default function TeacherProfile() {
  const { user } = useAuth();
  const { update, loading, error, success } = useProfile();
  const [fullName, setFullName] = useState(user?.full_name ?? '');

  if (!user) return null;

  const status = user.instructor_status ?? 'pending';
  const initials = (user.full_name || 'Instructor')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isDirty = fullName.trim() !== '' && fullName !== user.full_name;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isDirty) return;
    try {
      await update({ full_name: fullName.trim() });
    } catch {
      /* Errors are handled by the hook */
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col justify-between space-y-8 pb-12">
      <div className="w-full space-y-8">
        <PageHeader
          title="Teacher Profile"
          subtitle="Manage your personal account details, security settings, and instructor verification status."
        />

        {/* Top Identity & Status Overview Card */}
        <div className="flex flex-col justify-between gap-6 rounded-xl border border-surface-container bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(18,18,20,0.03)] sm:p-8 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-carbon text-2xl font-black tracking-tight text-white shadow-sm">
              {initials}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                {status === 'approved' ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#CCF3CE] px-3.5 py-1 text-xs font-bold tracking-tight text-[#111111]">
                    <span className="h-2 w-2 rounded-full bg-[#111111]" />
                    Approved Instructor
                  </span>
                ) : status === 'rejected' ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#FFE2E5] px-3.5 py-1 text-xs font-bold tracking-tight text-[#111111]">
                    <span className="h-2 w-2 rounded-full bg-[#E11D48]" />
                    Application Rejected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#FDEBC8] px-3.5 py-1 text-xs font-bold tracking-tight text-[#111111]">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#111111]" />
                    Pending Approval
                  </span>
                )}

                <span className="rounded-full border border-surface-container bg-surface-container/60 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-on-surface-variant">
                  {user.role}
                </span>
              </div>

              <h2 className="text-2xl font-black text-carbon">{user.full_name}</h2>
              <p className="text-sm font-medium text-on-surface-variant">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-surface-container pt-4 lg:border-t-0 lg:pt-0">
            <Link to="/change-password">
              <Button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-surface-container bg-white px-5 py-2.5 text-sm font-extrabold text-carbon transition hover:bg-surface-container"
              >
                <svg className="h-4 w-4 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                <span>Change Password</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Rejection Alert Banner (if applicable) */}
        {status === 'rejected' && user.instructor_review_reason && (
          <div className="flex items-start gap-3.5 rounded-xl border border-[#FFE2E5] bg-[#FFE2E5]/50 p-5 text-sm text-[#111111]">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-[#E11D48]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <div>
              <p className="font-extrabold">Instructor Application Rejected</p>
              <p className="mt-1 font-medium text-[#111111]/85">{user.instructor_review_reason}</p>
            </div>
          </div>
        )}

        {/* Main Content Grid: Account Form + Profile Information */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left / Primary: Personal Details Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-xl border border-surface-container bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(18,18,20,0.03)] sm:p-8 lg:col-span-2"
          >
            <div className="border-b border-surface-container pb-4">
              <h3 className="text-lg font-extrabold text-carbon">Account Information</h3>
              <p className="mt-1 text-sm font-medium text-on-surface-variant">
                Update how your name appears to students across courses and classrooms.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Input
                id="full_name"
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                required
                minLength={2}
              />

              <Input
                id="email"
                label="Email Address"
                value={user.email}
                disabled
                hint="Email addresses cannot be changed."
              />
            </div>

            {/* Feedback & Submit Footer */}
            <div className="flex flex-col-reverse justify-between gap-4 border-t border-surface-container pt-6 sm:flex-row sm:items-center">
              <div className="text-sm font-bold">
                {success && (
                  <span className="inline-flex items-center gap-1.5 text-[#15803D]">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Profile updated successfully!
                  </span>
                )}
                {error && <span className="text-error">{error}</span>}
              </div>

              <div className="flex items-center justify-end gap-3">
                {isDirty && (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={loading}
                    onClick={() => setFullName(user.full_name)}
                    className="rounded-full px-5 font-bold text-on-surface-variant hover:bg-surface-container"
                  >
                    Reset
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={loading || !isDirty}
                  className="rounded-full bg-carbon px-8 py-2.5 text-sm font-extrabold text-white transition-all hover:bg-carbon-light disabled:opacity-50"
                >
                  {loading ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>

          {/* Right: Public Profile & Verification Info */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-xl border border-surface-container bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(18,18,20,0.03)] sm:p-7">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container text-carbon">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
              </div>

              <h3 className="text-base font-extrabold text-carbon">Public Visibility & Verification</h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                Your full name is displayed to enrolled and prospective students on the public course catalogue and inside your classrooms.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                {status === 'approved'
                  ? 'Your instructor credentials have been verified. You can publish courses and grade student submissions.'
                  : 'Your biography and teaching qualifications submitted during registration are reviewed by the administration team.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}