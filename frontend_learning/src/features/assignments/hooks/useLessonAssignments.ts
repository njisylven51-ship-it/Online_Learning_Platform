import { useCallback, useEffect, useState } from 'react';
import { assignmentService } from '../services/assignmentService';
import { ApiError } from '../../../services/api/client';
import type { Assignment, Submission } from '../types';

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
      let uploadedPublicId: string | null = null;

      try {
        if (file) {
          const sig = await assignmentService.getUploadSignature();
          console.log('[assignment upload] SIGNATURE:', sig);
          console.log('[assignment upload] backend resource_type:', sig.resource_type);

          const fileNameWithExt = file.name.toLowerCase().endsWith('.pdf')
            ? file.name
            : `${file.name.replace(/\.[^/.]+$/, '')}.pdf`;
          const fileToUpload = new File([file], fileNameWithExt, {
            type: 'application/pdf',
          });

          const formData = new FormData();
          formData.append('file', fileToUpload);
          if (sig.api_key) formData.append('api_key', sig.api_key);
          if (sig.signature) formData.append('signature', sig.signature);

          // Send only the parameters the backend signed
          // (skip signature, api_key, cloud_name, resource_type, upload_url, public_id)
          Object.keys(sig).forEach((key) => {
            if (
              ![
                'signature',
                'api_key',
                'cloud_name',
                'resource_type',
                'upload_url',
                'public_id',
              ].includes(key)
            ) {
              const value = (sig as any)[key];
              if (value !== undefined && value !== null) {
                formData.append(key, String(value));
              }
            }
          });

          // ⚠️ CRITICAL FIX: pick the endpoint based on what the backend signed
          // so the file lands in the same resource_type bucket the backend will
          // query with get_resource(public_id, <resource_type>).
          const signedType = (sig as any).resource_type;
          let endpoint: 'image' | 'raw' | 'video' = 'raw';
          if (signedType === 'image') endpoint = 'image';
          else if (signedType === 'video') endpoint = 'video';
          // "document" → Cloudinary has no such type → falls back to raw

          const uploadUrl =
            (sig as any).upload_url ||
            `https://api.cloudinary.com/v1_1/${sig.cloud_name}/${endpoint}/upload`;

          console.log('[assignment upload] USING ENDPOINT:', uploadUrl);

          const cloudRes = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
          });

          if (!cloudRes.ok) {
            const errData = await cloudRes.json();
            console.error('[assignment upload] CLOUDINARY ERROR:', errData);
            throw new Error(errData.error?.message || 'File upload failed');
          }

          const cloudData = await cloudRes.json();
          console.log('[assignment upload] CLOUDINARY RESPONSE:', cloudData);

          // Use Cloudinary's public_id exactly as returned
          uploadedPublicId = cloudData.public_id;
          console.log('[assignment upload] FINAL public_id sent to backend:', uploadedPublicId);
        }

        const result = await assignmentService.submit(
          assignmentId,
          text || null,
          uploadedPublicId,
        );
        setSubmissions((prev) => ({ ...prev, [assignmentId]: result }));
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Submission failed.');
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