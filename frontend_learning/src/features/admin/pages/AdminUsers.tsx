import { useAdminUsers } from '../hooks/useAdminUsers';
import { PageHeader } from '../../../components/common/PageHeader';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../utils/formatDate';

export default function AdminUsers() {
  const { users, loading, processing, toggleStatus } = useAdminUsers();

  if (loading) return <LoadingState message="Loading users…" />;

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" subtitle="View and manage all platform accounts." />
      
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-forest-tint">
            <tr>
              <th className="px-4 py-3 font-medium text-forest">Name</th>
              <th className="px-4 py-3 font-medium text-forest">Email</th>
              <th className="px-4 py-3 font-medium text-forest">Role</th>
              <th className="px-4 py-3 font-medium text-forest">Status</th>
              <th className="px-4 py-3 font-medium text-forest">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-forest-tint/50">
                <td className="px-4 py-3 font-medium text-forest">{u.full_name}</td>
                <td className="px-4 py-3 text-ink-muted">{u.email}</td>
                <td className="px-4 py-3 capitalize">{u.role}</td>
                <td className="px-4 py-3">
                  <Badge tone={u.is_active ? 'success' : 'danger'}>{u.is_active ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Button 
                    size="sm" 
                    variant={u.is_active ? 'secondary' : 'primary'}
                    onClick={() => toggleStatus(u.id, u.is_active)}
                    disabled={!!processing}
                  >
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}