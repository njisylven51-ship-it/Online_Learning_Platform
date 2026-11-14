import { useCallback, useState } from 'react';
import { courseService } from '../../courses/services/courseService';
import { ApiError } from '../../../services/api/client';
import type { LessonCreatePayload } from '../../courses/types';

export function useLessonManager(moduleId: string) {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState<string | null>(null); // stores lessonId

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await courseService.getLessons(moduleId);
      setLessons(data.sort((a, b) => a.position - b.position));
    } catch (e) {
      setError(e instanceof ApiError ? e.info.message : 'Failed to load lessons.');
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  const createLesson = useCallback(async (payload: LessonCreatePayload) => {
    setCreating(true);
    try {
      await courseService.createLesson(moduleId, payload);
      await fetchLessons();
    } finally {
      setCreating(false);
    }
  }, [moduleId, fetchLessons]);

  const uploadVideo = useCallback(async (lessonId: string, file: File) => {
    setUploadingVideo(lessonId);
    try {
      // 1. Get signature from backend
      const sig = await courseService.getVideoUploadSignature(lessonId);

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sig.api_key);
      formData.append('timestamp', sig.timestamp.toString());
      formData.append('signature', sig.signature);
      if (sig.folder) formData.append('folder', sig.folder);
      if (sig.public_id) formData.append('public_id', sig.public_id);
      if (sig.upload_preset) formData.append('upload_preset', sig.upload_preset);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/video/upload`,
        { method: 'POST', body: formData }
      );
      
      if (!cloudRes.ok) throw new Error('Upload to Cloudinary failed');
      const cloudData = await cloudRes.json();

      // 3. Confirm upload with backend
      await courseService.confirmVideoUpload(lessonId, cloudData.public_id);
      
      await fetchLessons(); // Refresh to show the video is ready
      alert('Video uploaded and processed successfully!');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Video upload failed.');
    } finally {
      setUploadingVideo(null);
    }
  }, [fetchLessons]);

  return { 
    lessons, 
    loading, 
    error, 
    creating, 
    uploadingVideo, 
    fetchLessons, 
    createLesson, 
    uploadVideo 
  };
}