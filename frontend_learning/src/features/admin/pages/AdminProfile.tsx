import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useProfile } from '../../user/hooks/useProfile';
import { PageHeader } from '../../../components/common/PageHeader';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

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
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Administrator Profile"
        subtitle="Manage your platform account."
      />

      <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4 border-b border-line pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-forest text-2xl font-bold text-accent">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-forest">{user.full_name}</h2>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge tone="danger">ADMINISTRATOR</Badge>
              <Badge tone="success">Active</Badge>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email Address"
            value={user.email}
            disabled
            hint="Email addresses cannot be changed."
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
              className="text-sm font-medium text-accent hover:underline"
            >
              Change Password →
            </Link>

            <div className="flex items-center gap-3">
              {success && (
                <span className="text-sm font-medium text-accent">Saved!</span>
              )}
              {error && (
                <span className="text-sm text-red-600">{error}</span>
              )}
              <Button
                type="submit"
                disabled={loading || fullName === user.full_name}
              >
                {loading ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Admin-specific info */}
      <div className="rounded-xl border border-line bg-forest-tint p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-forest">Administrator Account</h3>
        <p className="mt-2 text-sm text-ink-muted">
          Administrator accounts are provisioned through the backend CLI and
          cannot be created via the public registration flow. For security
          reasons, admin accounts cannot be deactivated from the frontend — they
          must be managed by another administrator or via the CLI.
        </p>
      </div>
    </div>
  );
}