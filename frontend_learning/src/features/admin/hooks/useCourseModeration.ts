import { useCallback, useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import type { Course } from '../../courses/types';

export function useCourseModeration() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try { setCourses(await adminService.getPendingCourses()); } 
    catch (e) { console.error(e); } 
    finally { setLoading(false); }
  }, []);

  const review = async (id: string, approved: boolean) => {
    setProcessing(id);
    try { await adminService.reviewCourse(id, approved); await fetch(); } 
    catch (e) { alert('Review failed.'); } 
    finally { setProcessing(null); }
  };

  useEffect(() => { void fetch(); }, [fetch]);
  return { courses, loading, processing, review };
}