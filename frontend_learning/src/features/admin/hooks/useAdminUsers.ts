import { useCallback, useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import type { AuthUser } from '../../../types/user';

export function useAdminUsers() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try { setUsers(await adminService.getUsers()); } 
    catch (e) { console.error(e); } 
    finally { setLoading(false); }
  }, []);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setProcessing(id);
    try { await adminService.toggleUserStatus(id, !currentStatus); await fetch(); } 
    catch (e) { alert('Failed to update user.'); } 
    finally { setProcessing(null); }
  };

  useEffect(() => { void fetch(); }, [fetch]);
  return { users, loading, processing, toggleStatus };
}