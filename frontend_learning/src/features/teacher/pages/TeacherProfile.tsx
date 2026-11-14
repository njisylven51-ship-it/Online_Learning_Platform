import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useProfile } from '../../user/hooks/useProfile';
import { PageHeader } from '../../../components/common/PageHeader';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

export default function TeacherProfile() {
  const { user } = useAuth();
  const { update, loading, error, success } = useProfile();
  const [fullName, setFullName] = useState(user?.full_name ?? '');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await update({ full_name: fullName });
    } catch {
      /* Errors are handled by the hook */
    }
  }

  if (!user) return null;

  const status = user.instructor_status ?? 'pending';
  const tone = status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader 
        title="Teacher Profile" 
        subtitle="Manage your account information and view your instructor status." 
      />

      <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
        {/* Avatar & Status Header */}
        <div className="mb-6 flex items-center gap-4 border-b border-line pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-forest">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-forest">{user.full_name}</h2>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge tone="neutral">{user.role.toUpperCase()}</Badge>
              <Badge tone={tone}>Instructor: {status.toUpperCase()}</Badge>
            </div>
          </div>
        </div>

        {/* Profile Form */}
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
          
          {/* Show rejection reason if applicable */}
          {status === 'rejected' && user.instructor_review_reason && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <strong>Rejection Reason:</strong> {user.instructor_review_reason}
            </div>
          )}

          <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/change-password" className="text-sm font-medium text-accent hover:underline">
              Change Password →
            </Link>
            
            <div className="flex items-center gap-3">
              {success && <span className="text-sm font-medium text-accent">Saved successfully!</span>}
              {error && <span className="text-sm text-red-600">{error}</span>}
              <Button type="submit" disabled={loading || fullName === user.full_name}>
                {loading ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Info Card explaining Profile Details */}
      <div className="rounded-xl border border-line bg-forest-tint p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-forest">About your profile</h3>
        <p className="mt-2 text-sm text-ink-muted">
          Your name is displayed to students on the public course catalogue and in the classroom. 
          Your biography and qualifications were submitted during registration and are currently under review by the administration.
        </p>
      </div>
    </div>
  );
}