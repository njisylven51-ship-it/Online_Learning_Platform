import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useProfile } from '../../user/hooks/useProfile';
import { PageHeader } from '../../../components/common/PageHeader';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export default function AdminProfile() {
  const { user } = useAuth();
  const { update, loading, error, success } = useProfile();
  const [fullName, setFullName] = useState(user?.full_name ?? '');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await update({ full_name: fullName });
    } catch {
      /* handled by hook */
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto  space-y-8 pb-8">
      <PageHeader
        title="Administrator Profile"
        subtitle="Manage your platform account."
      />

      <div className="rounded-2xl border border-surface-container bg-surface-container-lowest p-8 shadow-[0_8px_24px_rgba(18,18,20,0.04)]">
        {/* Header */}
        <div className="mb-8 flex items-center gap-5 border-b border-surface-container pb-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-container text-3xl font-extrabold text-on-primary-container">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-carbon">{user.full_name}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-lg bg-error-container px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-on-error-container">
                Administrator
              </span>
              <span className="rounded-lg bg-secondary-container px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-on-secondary-container">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="email"
            label="Email Address"
            value={user.email}
            disabled
            hint="Email addresses cannot be changed."
            className="bg-surface-container/50"
          />
          <Input
            id="full_name"
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
            required
          />

          <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/change-password"
              className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Change Password →
            </Link>

            <div className="flex items-center gap-4">
              {success && (
                <span className="text-sm font-bold text-secondary">Saved!</span>
              )}
              {error && (
                <span className="text-sm font-bold text-error">{error}</span>
              )}
              <Button
                type="submit"
                disabled={loading || fullName === user.full_name}
                className="rounded-lg bg-carbon px-8 py-3 text-sm font-extrabold text-white hover:bg-carbon-light disabled:opacity-50"
              >
                {loading ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Admin-specific info */}
      <div className="rounded-2xl border border-surface-container bg-surface-container/50 p-6">
        <h3 className="text-base font-extrabold text-carbon">Administrator Account</h3>
        <p className="mt-2 text-sm font-medium leading-relaxed text-on-surface-variant">
          Administrator accounts are provisioned through the backend CLI and
          cannot be created via the public registration flow. For security
          reasons, admin accounts cannot be deactivated from the frontend — they
          must be managed by another administrator or via the CLI.
        </p>
      </div>
    </div>
  );
}