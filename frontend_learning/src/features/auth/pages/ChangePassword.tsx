import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChangePassword } from '../hooks/useChangePassword';
import { PageHeader } from '../../../components/common/PageHeader';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { change, loading, error, success, fieldErrors } = useChangePassword();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const meetsMinLength = next.length >= 10;
  const passwordsMatch = confirm.length > 0 && next === confirm;
  const showMismatch = confirm.length > 0 && next !== confirm;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);

    if (next !== confirm) {
      setLocalError('New passwords do not match.');
      return;
    }

    try {
      await change(current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch {
      /* errors surfaced by hook */
    }
  }

  const activeError = localError ?? error;

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant transition-colors hover:text-primary"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>

        <PageHeader
          title="Change Password"
          subtitle="Keep your account secure with a strong, unique password."
        />
      </div>

      {/* Main Card */}
      <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_10px_30px_rgba(18,18,20,0.04)]">
        {/* Pastel Header Banner */}
        <div className="relative h-28 overflow-hidden bg-gradient-to-br from-primary/15 via-surface-container to-secondary-container/30 sm:h-32">
          <div
            className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]"
            aria-hidden="true"
          />
          <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-primary-container/50 blur-2xl" />
          <div className="absolute right-8 top-4 h-28 w-28 rounded-full bg-secondary-container/50 blur-2xl" />
        </div>

        <div className="px-6 pb-8 sm:px-8">
          {/* Overlapping Security Badge */}
          <div className="-mt-10 mb-6 flex items-end gap-4 sm:-mt-12">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container shadow-lg ring-4 ring-surface-container-lowest sm:h-24 sm:w-24">
              <svg className="h-9 w-9 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>

            <div className="pb-1">
              <h2 className="text-xl font-extrabold tracking-tight text-carbon sm:text-2xl">
                Password & Credentials
              </h2>
              <p className="mt-0.5 text-xs font-medium text-on-surface-variant">
                Verify your current password before setting a new one.
              </p>
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
              <span>Your password has been updated successfully.</span>
            </div>
          )}

          {activeError && (
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
              <span>{activeError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6 border-t border-surface-container pt-7" noValidate>
            <div>
              <Input
                id="current"
                label="Current Password"
                type="password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                error={fieldErrors.current_password}
                disabled={loading}
                required
                placeholder="Enter your current password"
              />
            </div>

            <div className="space-y-5 rounded-xl bg-surface-container/50 p-5">
              <div>
                <Input
                  id="next"
                  label="New Password"
                  type="password"
                  autoComplete="new-password"
                  value={next}
                  onChange={(e) => {
                    setNext(e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  error={fieldErrors.new_password}
                  disabled={loading}
                  required
                  placeholder="Create a new password"
                />

                {/* Live Requirement Pill */}
                <div className="mt-2 ml-1 flex items-center gap-2 text-xs font-semibold">
                  <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded-full transition-colors ${
                      meetsMinLength
                        ? 'bg-secondary-container text-secondary'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {meetsMinLength ? (
                      <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  <span className={meetsMinLength ? 'text-secondary' : 'text-on-surface-variant'}>
                    At least 10 characters
                  </span>
                </div>
              </div>

              <div>
                <Input
                  id="confirm"
                  label="Confirm New Password"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  disabled={loading}
                  required
                  placeholder="Repeat your new password"
                />

                {showMismatch && (
                  <p className="mt-1.5 ml-1 text-xs font-bold text-error">
                    Passwords do not match yet.
                  </p>
                )}
                {passwordsMatch && (
                  <p className="mt-1.5 ml-1 text-xs font-bold text-secondary">
                    Passwords match.
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="w-full rounded-full px-6 py-3 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-carbon sm:w-auto"
              >
                Cancel
              </button>

              <Button
                type="submit"
                disabled={loading || !current || !next || !confirm || showMismatch}
                className="w-full rounded-full bg-carbon px-8 py-3 text-sm font-extrabold text-white transition-all hover:bg-carbon-light disabled:opacity-40 sm:w-auto"
              >
                {loading ? 'Updating Password…' : 'Update Password'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}