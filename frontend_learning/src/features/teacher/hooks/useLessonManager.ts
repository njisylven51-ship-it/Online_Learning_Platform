import { useCallback, useState } from 'react';
import { courseService } from '../../courses/services/courseService';
import { ApiError } from '../../../services/api/client';
import type { LessonCreatePayload, AssignmentCreatePayload } from '../../courses/types';

export function useLessonManager(moduleId: string) {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState<string | null>(null);
  const [creatingAssignment, setCreatingAssignment] = useState<string | null>(null);

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
      const sig = await courseService.getVideoUploadSignature(lessonId);
      
      const formData = new FormData();
      formData.append('file', file);
      
      if (sig.api_key) formData.append('api_key', sig.api_key);
      if (sig.signature) formData.append('signature', sig.signature);

      Object.keys(sig).forEach(key => {
        if (!['signature', 'api_key', 'cloud_name', 'resource_type'].includes(key)) {
          const value = sig[key as keyof typeof sig];
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        }
      });

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/video/upload`,
        { method: 'POST', body: formData }
      );
      
      if (!cloudRes.ok) {
        const errorData = await cloudRes.json();
        throw new Error(errorData.error?.message || 'Upload to Cloudinary failed');
      }
      
      const cloudData = await cloudRes.json();
      await courseService.confirmVideoUpload(lessonId, cloudData.public_id);
      await fetchLessons();
      alert('Video uploaded successfully!');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Video upload failed.');
    } finally {
      setUploadingVideo(null);
    }
  }, [fetchLessons]);

  const uploadPdf = useCallback(async (lessonId: string, file: File, title: string) => {
    setUploadingPdf(lessonId);
    try {
      const sig = await courseService.getResourceSignature('document');
      
      // Force the file to be named with .pdf extension
      const fileNameWithExt = file.name.toLowerCase().endsWith('.pdf') 
        ? file.name 
        : `${file.name.replace(/\.[^/.]+$/, '')}.pdf`;
      
      const fileToUpload = new File([file], fileNameWithExt, { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('file', fileToUpload);
      
      if (sig.api_key) formData.append('api_key', sig.api_key);
      if (sig.signature) formData.append('signature', sig.signature);

      Object.keys(sig).forEach(key => {
        if (!['signature', 'api_key', 'cloud_name', 'resource_type'].includes(key)) {
          const value = sig[key as keyof typeof sig];
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        }
      });

      // Upload to /raw/upload
      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/raw/upload`,
        { method: 'POST', body: formData }
      );
      
      if (!cloudRes.ok) {
        const errorData = await cloudRes.json();
        throw new Error(errorData.error?.message || 'Upload to Cloudinary failed');
      }
      
      const cloudData = await cloudRes.json();
      
      // 🚨 CHECK THE BROWSER CONSOLE FOR THIS LOG 🚨
      console.log('Cloudinary Response:', {
        public_id: cloudData.public_id,
        format: cloudData.format, // This MUST be "pdf"
        resource_type: cloudData.resource_type
      });

      // Ensure public_id ends in .pdf
      let finalPublicId = cloudData.public_id;
      if (!finalPublicId.toLowerCase().endsWith('.pdf')) {
        finalPublicId += '.pdf';
      }

      // Send "document" to the backend
      await courseService.confirmResource({
        lesson_id: lessonId,
        title: title || file.name,
        public_id: finalPublicId,
        resource_type: 'document', 
      });
      
      alert('PDF uploaded successfully!');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'PDF upload failed.');
    } finally {
      setUploadingPdf(null);
    }
  }, []);

  const createAssignment = useCallback(async (lessonId: string, payload: AssignmentCreatePayload) => {
    setCreatingAssignment(lessonId);
    try {
      await courseService.createAssignment(lessonId, payload);
      alert('Assignment created successfully!');
    } catch (e) {
      alert(e instanceof ApiError ? e.info.message : 'Failed to create assignment.');
    } finally {
      setCreatingAssignment(null);
    }
  }, []);

  return { 
    lessons, 
    loading, 
    error, 
    creating, 
    uploadingVideo, 
    uploadingPdf,
    creatingAssignment,
    fetchLessons, 
    createLesson, 
    uploadVideo,
    uploadPdf,
    createAssignment
  };
}