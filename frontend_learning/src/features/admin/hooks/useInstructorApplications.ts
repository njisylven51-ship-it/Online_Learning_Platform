import { useCallback, useEffect, useState } from 'react';
import { adminService, type InstructorApplication } from '../services/adminService';

export function useInstructorApplications() {
  const [apps, setApps] = useState<InstructorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try { setApps(await adminService.getInstructorApplications()); } 
    catch (e) { console.error(e); } 
    finally { setLoading(false); }
  }, []);

  const review = async (id: string, approved: boolean) => {
    setProcessing(id);
    try { await adminService.reviewInstructor(id, approved); await fetch(); } 
    catch (e) { alert('Review failed.'); } 
    finally { setProcessing(null); }
  };

  useEffect(() => { void fetch(); }, [fetch]);
  return { apps, loading, processing, review };
}