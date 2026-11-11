import { useAuth } from '../../../../contexts/AuthContext';

export default function AdminHome() {
  const { user } = useAuth();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-forest">
        Administrator dashboard
      </h1>
      <p className="text-ink-muted">
        Signed in as {user?.full_name}. Platform statistics and moderation queues
        will appear here in Step 5.
      </p>
    </div>
  );
}