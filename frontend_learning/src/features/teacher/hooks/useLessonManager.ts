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

      // Use upload_url from backend if provided, otherwise fallback to video/upload
      const uploadUrl = (sig as any).upload_url || `https://api.cloudinary.com/v1_1/${sig.cloud_name}/video/upload`;

      Object.keys(sig).forEach(key => {
        if (!['signature', 'api_key', 'cloud_name', 'resource_type', 'upload_url'].includes(key)) {
          const value = sig[key as keyof typeof sig];
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        }
      });

      const cloudRes = await fetch(uploadUrl, {
        method: 'POST', 
        body: formData 
      });
      
      if (!cloudRes.ok) {
        const errorData = await cloudRes.json();
        throw new Error(errorData.error?.message || 'Upload to Cloudinary failed');
      }
      
      const cloudData = await cloudRes.json();
      
      // 1. Confirm with backend
      let videoRecord = await courseService.confirmVideoUpload(lessonId, cloudData.public_id);
      
      // 2. Polling Loop
      let attempts = 0;
      while (videoRecord.status === 'processing' || videoRecord.duration_seconds === 0) {
        if (attempts >= 10) { 
          alert('Video uploaded, but Cloudinary is taking a long time to process. Please check back later.');
          break;
        }
        
        console.log(`Processing... retry ${attempts + 1}/10`);
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3s
        
        try {
          videoRecord = await courseService.retryVideoProcessing(videoRecord.id);
        } catch (err) {
          // Backend returns 409 if still processing; we ignore and let the loop continue
        }
        attempts++;
      }

      if (videoRecord.status === 'ready') {
        alert('Video uploaded and processed successfully!');
      }

      await fetchLessons();
      
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

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/raw/upload`,
        { method: 'POST', body: formData }
      );
      
      if (!cloudRes.ok) {
        const errorData = await cloudRes.json();
        throw new Error(errorData.error?.message || 'Upload to Cloudinary failed');
      }
      
      const cloudData = await cloudRes.json();
      
      let finalPublicId = cloudData.public_id;
      if (!finalPublicId.toLowerCase().endsWith('.pdf')) {
        finalPublicId += '.pdf';
      }

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