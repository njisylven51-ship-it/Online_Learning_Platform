import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useProfile } from '../../user/hooks/useProfile';
import { PageHeader } from '../../../components/common/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export default function StudentProfile() {
  const { user } = useAuth();
  const { update, loading, error, success } = useProfile();
  const [fullName, setFullName] = useState(user?.full_name ?? '');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim() === user?.full_name) return;

    try {
      await update({ full_name: fullName.trim() });
    } catch {
      /* Errors are handled by the hook */
    }
  }

  if (!user) return null;

  const initials =
    user.full_name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'S';

  const hasChanges = fullName.trim() !== '' && fullName.trim() !== user.full_name;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal details and account security."
      />

      {/* Main Identity & Details Card */}
      <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_10px_30px_rgba(18,18,20,0.04)]">
        {/* Pastel Header Banner */}
        <div className="relative h-32 overflow-hidden bg-gradient-to-br from-primary/15 via-surface-container to-secondary-container/30 sm:h-36">
          <div
            className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]"
            aria-hidden="true"
          />
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary-container/50 blur-2xl" />
          <div className="absolute right-8 top-4 h-32 w-32 rounded-full bg-secondary-container/50 blur-2xl" />
        </div>

        <div className="px-6 pb-8 sm:px-8">
          {/* Avatar & Identity Summary */}
          <div className="-mt-14 mb-8 flex flex-col items-center gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:gap-6">
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-3xl font-extrabold tracking-tight text-on-primary-container shadow-lg ring-4 ring-surface-container-lowest sm:h-32 sm:w-32 sm:text-4xl">
              {initials}
            </div>

            <div className="flex flex-1 flex-col items-center text-center sm:items-start sm:pb-1 sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
                <h2 className="text-2xl font-extrabold tracking-tight text-carbon sm:text-3xl">
                  {user.full_name}
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  Active
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-on-surface-variant sm:justify-start">
                <span>{user.email}</span>
                <span aria-hidden="true" className="text-outline/40">•</span>
                <span className="rounded-md bg-surface-container px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback Banners */}
          {success && (
            <div
              role="status"
              className="mb-6 flex items-center gap-3 rounded-xl bg-secondary-container/60 px-4 py-3 text-sm font-bold text-on-secondary-container"
            >
              <svg className="h-5 w-5 shrink-0 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Your profile details have been updated.</span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-6 flex items-center gap-3 rounded-xl bg-error/10 px-4 py-3 text-sm font-bold text-error"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Account Details Form */}
          <form onSubmit={handleSubmit} className="space-y-6 border-t border-surface-container pt-7">
            <div>
              <h3 className="text-base font-extrabold text-carbon">Personal Information</h3>
              <p className="mt-0.5 text-xs font-medium text-on-surface-variant">
                Update how your name appears across courses and certificates.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Input
                  id="full_name"
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email_readonly"
                  className="mb-2 ml-1 block text-sm font-bold text-carbon"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email_readonly"
                    value={user.email}
                    disabled
                    className="block w-full cursor-not-allowed rounded-xl bg-surface-container/70 px-4 py-3.5 pr-10 text-sm font-semibold text-on-surface-variant"
                  />
                  <svg
                    className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline/60"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>
                <p className="mt-1.5 ml-1 text-xs font-medium text-on-surface-variant">
                  Managed by your institution and cannot be changed.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {hasChanges && (
                <button
                  type="button"
                  onClick={() => setFullName(user.full_name)}
                  disabled={loading}
                  className="rounded-full px-5 py-3 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-carbon"
                >
                  Reset
                </button>
              )}

              <Button
                type="submit"
                disabled={loading || !hasChanges}
                className="w-full rounded-full bg-carbon px-8 py-3 text-sm font-extrabold text-white transition-all hover:bg-carbon-light disabled:opacity-40 sm:w-auto"
              >
                {loading ? 'Saving Changes…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Security Card */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-surface-container-lowest p-6 shadow-[0_10px_30px_rgba(18,18,20,0.04)] sm:flex-row sm:items-center sm:px-8">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-carbon">Password & Security</h3>
            <p className="mt-0.5 text-xs font-medium text-on-surface-variant">
              Update your password regularly to keep your student account secure.
            </p>
          </div>
        </div>

        <Link
          to="/change-password"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-surface-container px-5 py-2.5 text-sm font-bold text-carbon transition-colors hover:bg-primary/10 hover:text-primary sm:w-auto"
        >
          <span>Change Password</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>
    </div>
  );
}