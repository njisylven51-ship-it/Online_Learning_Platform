import { useState } from 'react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { PageHeader } from '../../../components/common/PageHeader';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../utils/formatDate';

const ROLE_STYLES: Record<string, string> = {
  student: 'bg-surface-container text-on-surface-variant',
  teacher: 'bg-primary-container text-on-primary-container',
  administrator: 'bg-tertiary-container text-on-tertiary-container',
};

const ROLE_LABELS: Record<string, string> = {
  student: 'Student',
  teacher: 'Teacher',
  administrator: 'Admin',
};

export default function AdminUsers() {
  const {
    users,
    loading,
    error,
    refetch,
    processing,
    toggleStatus,
  } = useAdminUsers();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  if (loading) return <LoadingState message="Loading users..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === 'all' || user.role === roleFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' ? user.is_active : !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeUsers = users.filter((user) => user.is_active).length;
  const inactiveUsers = users.length - activeUsers;

  const roleCounts = {
    student: users.filter((u) => u.role === 'student').length,
    teacher: users.filter((u) => u.role === 'teacher').length,
    administrator: users.filter((u) => u.role === 'administrator').length,
  };

  return (
    <div className="w-full space-y-7 pb-10">

      {/* Header */}
      <PageHeader
        title="User Management"
        subtitle="Manage platform accounts, permissions and user activity."
      />

      {/* Overview */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-surface-container bg-surface-container-lowest p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-on-surface-variant">
              Total Users
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m16 0v-2a4 4 0 00-3-3.87M12 7a4 4 0 11-8 0 4 4 0 018 0zm8 4a4 4 0 100-8" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-carbon">
            {users.length}
          </p>
          <p className="mt-1 text-xs font-medium text-on-surface-variant">
            Registered accounts
          </p>
        </div>

        <div className="rounded-2xl border border-surface-container bg-surface-container-lowest p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-on-surface-variant">
              Active Users
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-carbon">
            {activeUsers}
          </p>
          <p className="mt-1 text-xs font-medium text-on-surface-variant">
            Currently enabled accounts
          </p>
        </div>

        <div className="rounded-2xl border border-surface-container bg-surface-container-lowest p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-on-surface-variant">
              Inactive Users
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-error-container text-on-error-container">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" d="M8 12h8" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-carbon">
            {inactiveUsers}
          </p>
          <p className="mt-1 text-xs font-medium text-on-surface-variant">
            Disabled accounts
          </p>
        </div>

        <div className="rounded-2xl border border-surface-container bg-surface-container-lowest p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-on-surface-variant">
              Teachers
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.42M5 12v5c4 3 10 3 14 0v-5" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-carbon">
            {roleCounts.teacher}
          </p>
          <p className="mt-1 text-xs font-medium text-on-surface-variant">
            Registered instructors
          </p>
        </div>

      </section>

      {/* Main User Management */}
      <section className="w-full">

        {/* Toolbar */}
        <div className="space-y-5 border-b border-surface-container p-5 sm:p-6">

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-extrabold text-carbon">
                All Users
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Showing {filteredUsers.length} of {users.length} accounts
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-outline"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="m20 20-3.5-3.5" />
              </svg>

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full rounded-xl border border-surface-container bg-surface-container-lowest px-11 py-3 text-sm font-medium text-carbon outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-bold uppercase tracking-wider text-outline">
                Role
              </span>

              {[
                { value: 'all', label: 'All Roles' },
                { value: 'student', label: 'Students' },
                { value: 'teacher', label: 'Teachers' },
                { value: 'administrator', label: 'Admins' },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setRoleFilter(filter.value)}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                    roleFilter === filter.value
                      ? 'bg-carbon text-white'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-surface-container bg-surface-container-lowest px-3 py-2 text-sm font-semibold text-on-surface outline-none focus:border-primary"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

          </div>
        </div>

        {/* Desktop Table */}
        {filteredUsers.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="m20 20-3.5-3.5" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-bold text-carbon">
              No users found
            </h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              Try adjusting your search or filters.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
              className="mt-4 text-sm font-bold text-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container/60">
                  <tr>
                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-outline">
                      User
                    </th>
                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-outline">
                      Role
                    </th>
                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-outline">
                      Date Joined
                    </th>
                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-outline">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-wider text-outline">
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* Added bg-surface-container-lowest here so the rows have a clean white background */}
                <tbody className="divide-y divide-surface-container bg-surface-container-lowest">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-surface-container/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-container text-sm font-extrabold text-on-primary-container">
                            {user.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-carbon">
                              {user.full_name}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-on-surface-variant">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-bold ${ROLE_STYLES[user.role] || ROLE_STYLES.student}`}>
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-medium text-on-surface-variant">
                        {formatDate(user.created_at)}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                          user.is_active
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-error-container text-on-error-container'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            user.is_active ? 'bg-secondary' : 'bg-error'
                          }`} />
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => toggleStatus(user.id, user.is_active)}
                          disabled={processing === user.id}
                          className={`rounded-lg px-4 font-bold ${
                            user.is_active
                              ? 'bg-error-container text-on-error-container hover:bg-error-container/80'
                              : 'bg-carbon text-white hover:bg-carbon-light'
                          }`}
                        >
                          {processing === user.id
                            ? 'Updating...'
                            : user.is_active
                              ? 'Deactivate'
                              : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3 p-4 md:hidden">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  // Added bg-surface-container-lowest here for visibility
                  className="rounded-xl border border-surface-container bg-surface-container-lowest p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-container text-sm font-extrabold text-on-primary-container">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-carbon">
                          {user.full_name}
                        </p>
                        <p className="break-all text-xs text-on-surface-variant">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold ${ROLE_STYLES[user.role] || ROLE_STYLES.student}`}>
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-surface-container pt-3">
                    <div className="space-y-1">
                      <p className="text-xs text-on-surface-variant">
                        Joined: {formatDate(user.created_at)}
                      </p>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                        user.is_active
                          ? 'text-secondary'
                          : 'text-error'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          user.is_active ? 'bg-secondary' : 'bg-error'
                        }`} />
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => toggleStatus(user.id, user.is_active)}
                      disabled={processing === user.id}
                      className={`rounded-lg px-4 font-bold ${
                        user.is_active
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-carbon text-white'
                      }`}
                    >
                      {processing === user.id
                        ? 'Updating...'
                        : user.is_active
                          ? 'Deactivate'
                          : 'Activate'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t border-surface-container bg-surface-container/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-on-surface-variant">
            Displaying {filteredUsers.length} of {users.length} users
          </p>
          <p className="text-xs font-medium text-on-surface-variant">
            User Management
          </p>
        </div>

      </section>
    </div>
  );
}