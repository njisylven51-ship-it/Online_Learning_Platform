import { useCallback, useEffect, useState } from 'react';
import { assignmentService } from '../services/assignmentService';
import { ApiError } from '../../../services/api/client';
import type {
  Assignment,
  AssignmentUploadSignature,
  Submission,
} from '../types';

async function uploadAssignmentFile(
  file: File,
  sig: AssignmentUploadSignature,
): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.api_key);
  form.append('timestamp', String(sig.timestamp));
  form.append('signature', sig.signature);

  if (sig.folder) form.append('folder', sig.folder);

  const ext = (file.name.split('.').pop() || 'pdf').toLowerCase();
  let publicId: string;
  if (sig.public_id) {
    publicId = sig.public_id;
  } else if (sig.public_id_prefix) {
    publicId = `${sig.public_id_prefix}-${Date.now()}.${ext}`;
  } else {
    publicId = `assignment-${Date.now()}.${ext}`;
  }
  form.append('public_id', publicId);

  const uploadUrl =
    sig.upload_url ??
    (sig.cloud_name
      ? `https://api.cloudinary.com/v1_1/${sig.cloud_name}/raw/upload`
      : null);

  if (!uploadUrl) throw new Error('Upload signature missing upload_url/cloud_name');

  const res = await fetch(uploadUrl, { method: 'POST', body: form });
  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(errBody.error?.message || `Cloudinary upload failed (${res.status})`);
  }

  const data = (await res.json()) as { public_id: string };
  return data.public_id;
}

export function useLessonAssignments(lessonId: string) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [lessonAssignments, mySubs] = await Promise.all([
        assignmentService.getForLesson(lessonId),
        assignmentService.getMySubmissions(),
      ]);
      setAssignments(lessonAssignments);
      const subMap: Record<string, Submission> = {};
      mySubs.forEach((s) => {
        if (s.assignment_id) subMap[s.assignment_id] = s;
      });
      setSubmissions(subMap);
    } catch (e) {
      setError(e instanceof ApiError ? e.info.message : 'Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  const submit = useCallback(
    async (assignmentId: string, text: string, file: File | null) => {
      setSubmitting(assignmentId);
      setError(null);

      try {
        let uploadedPublicId: string | null = null;

        if (file) {
          const sig = await assignmentService.getUploadSignature();
          uploadedPublicId = await uploadAssignmentFile(file, sig);
        }

        const result = await assignmentService.submit(
          assignmentId,
          text || null,
          uploadedPublicId,
        );

        setSubmissions((prev) => ({ ...prev, [assignmentId]: result }));
        return result;
      } catch (e) {
        const msg =
          e instanceof ApiError
            ? e.info.message
            : e instanceof Error
            ? e.message
            : 'Submission failed.';
        setError(msg);
        throw e;
      } finally {
        setSubmitting(null);
      }
    },
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return { assignments, submissions, loading, submitting, error, submit, refetch: load };
}