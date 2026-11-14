import { useCallback, useEffect, useState } from 'react';
import { adminService, type AdminStats } from '../services/adminService';

export function useAdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try { setStats(await adminService.getDashboardStats()); } 
    catch (e) { console.error(e); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);
  return { stats, loading, refetch: fetch };
}