import { useCallback, useEffect, useState } from 'react';
import { teacherService, type StudentSubmission } from '../services/teacherService';
import { ApiError } from '../../../services/api/client';

export function useTeacherAssignments() {
  const [submissions, setSubmissions] = useState<StudentSubmission[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grading, setGrading] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teacherService.getSubmissions();
      setSubmissions(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.info.message : 'Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  }, []);

  const grade = useCallback(async (submissionId: string, score: number, feedback: string) => {
    setGrading(true);
    try {
      await teacherService.gradeSubmission(submissionId, score, feedback);
      await fetchSubmissions(); // Refresh the list
    } catch (e) {
      alert(e instanceof ApiError ? e.info.message : 'Failed to submit grade.');
    } finally {
      setGrading(false);
    }
  }, [fetchSubmissions]);

  useEffect(() => {
    void fetchSubmissions();
  }, [fetchSubmissions]);

  return { submissions, loading, error, grading, grade, refetch: fetchSubmissions };
}