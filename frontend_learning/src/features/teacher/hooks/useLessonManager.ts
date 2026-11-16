import { useCallback, useEffect, useState } from 'react';
import { courseService } from '../../courses/services/courseService';
import { assignmentService } from '../../assignments/services/assignmentService';
import { quizService } from '../../quizzes/services/quizService';
import { ApiError } from '../../../services/api/client';
import type { LessonCreatePayload, AssignmentCreatePayload } from '../../courses/types';

export function useLessonManager(moduleId: string) {
  const [lessons, setLessons] = useState<any[]>([]);
  const [resources, setResources] = useState<Record<string, any[]>>({});
  const [assignments, setAssignments] = useState<Record<string, any[]>>({});
  const [quizzes, setQuizzes] = useState<Record<string, any[]>>({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState<string | null>(null);
  const [creatingAssignment, setCreatingAssignment] = useState<string | null>(null);

  const fetchLessonData = useCallback(async (lessonId: string) => {
    try {
      // Fetch all related data in parallel
      const [resData, assignData, quizData] = await Promise.all([
        courseService.getLessonResources(lessonId).catch(() => []),
        assignmentService.getForLesson(lessonId).catch(() => []),
        quizService.getQuizzesForLesson(lessonId).catch(() => [])
      ]);
      
      setResources(prev => ({ ...prev, [lessonId]: resData }));
      setAssignments(prev => ({ ...prev, [lessonId]: assignData }));
      setQuizzes(prev => ({ ...prev, [lessonId]: quizData }));
    } catch (e) {
      console.error('Failed to load data for lesson', lessonId, e);
    }
  }, []);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await courseService.getLessons(moduleId);
      setLessons(data.sort((a, b) => a.position - b.position));
      // Fetch related data for all lessons in parallel
      await Promise.all(data.map((l: any) => fetchLessonData(l.id)));
    } catch (e) {
      setError(e instanceof ApiError ? e.info.message : 'Failed to load lessons.');
    } finally {
      setLoading(false);
    }
  }, [moduleId, fetchLessonData]);

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

      const uploadUrl = (sig as any).upload_url || `https://api.cloudinary.com/v1_1/${sig.cloud_name}/video/upload`;

      Object.keys(sig).forEach(key => {
        if (!['signature', 'api_key', 'cloud_name', 'resource_type', 'upload_url'].includes(key)) {
          const value = sig[key as keyof typeof sig];
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        }
      });

      const cloudRes = await fetch(uploadUrl, { method: 'POST', body: formData });
      if (!cloudRes.ok) throw new Error('Upload to Cloudinary failed');
      
      const cloudData = await cloudRes.json();
      let videoRecord = await courseService.confirmVideoUpload(lessonId, cloudData.public_id);
      
      let attempts = 0;
      while (videoRecord.status === 'processing' || videoRecord.duration_seconds === 0) {
        if (attempts >= 10) break;
        await new Promise(resolve => setTimeout(resolve, 3000));
        try {
          videoRecord = await courseService.retryVideoProcessing(videoRecord.id);
        } catch { /* ignore */ }
        attempts++;
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
      
      const fileNameWithExt = file.name.toLowerCase().endsWith('.pdf') ? file.name : `${file.name}.pdf`;
      const fileToUpload = new File([file], fileNameWithExt, { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('file', fileToUpload);
      
      if (sig.api_key) formData.append('api_key', sig.api_key);
      if (sig.signature) formData.append('signature', sig.signature);

      Object.keys(sig).forEach(key => {
        if (!['signature', 'api_key', 'cloud_name', 'resource_type'].includes(key)) {
          const value = sig[key as keyof typeof sig];
          if (value !== undefined && value !== null) formData.append(key, String(value));
        }
      });

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud_name}/raw/upload`, { method: 'POST', body: formData });
      if (!cloudRes.ok) throw new Error('Upload failed');
      
      const cloudData = await cloudRes.json();
      let finalPublicId = cloudData.public_id;
      if (!finalPublicId.toLowerCase().endsWith('.pdf')) finalPublicId += '.pdf';

      await courseService.confirmResource({
        lesson_id: lessonId,
        title: title || file.name,
        public_id: finalPublicId,
        resource_type: 'document', 
      });
      
      await fetchLessonData(lessonId);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'PDF upload failed.');
    } finally {
      setUploadingPdf(null);
    }
  }, [fetchLessonData]);

  const createAssignment = useCallback(async (lessonId: string, payload: AssignmentCreatePayload) => {
    setCreatingAssignment(lessonId);
    try {
      await courseService.createAssignment(lessonId, payload);
      await fetchLessonData(lessonId);
    } catch (e) {
      alert(e instanceof ApiError ? e.info.message : 'Failed to create assignment.');
    } finally {
      setCreatingAssignment(null);
    }
  }, [fetchLessonData]);

  return { 
    lessons, 
    resources,
    assignments,
    quizzes,
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