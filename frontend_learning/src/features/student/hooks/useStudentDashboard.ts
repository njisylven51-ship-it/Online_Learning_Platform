import { useCallback, useEffect, useState } from 'react';
import { enrolmentService } from '../../enrolments/services/enrolmentService';
import { courseService } from '../../courses/services/courseService';
import { classroomService } from '../../../features/classroom/services/classroomService';
import { ApiError } from '../../../services/api/client';
import type { EnrolledCourse } from '../types';

export function useStudentDashboard() {
  const [courses, setCourses] = useState<EnrolledCourse[] | null>(null);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    totalCompleted: 0,
    totalLessonsCompleted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const enrolments = await enrolmentService.getMyEnrolments();
      
      // 🚨 DEBUGGING: Look at your browser console for this log!
      console.log('Enrolments received from backend:', enrolments);

      // FIXED: If is_active is missing, assume it is active.
      const active = enrolments.filter((e: any) => e.is_active !== false);

      const combined = await Promise.all(
        active.map(async (enrolment) => {
          let course = null;
          let progress = null;

          try {
            course = await courseService.getCourse(enrolment.course_id);
          } catch (err) {
            console.error(`Failed to load course details for ${enrolment.course_id}`, err);
            return null;
          }

          try {
            progress = await classroomService.getCourseProgress(enrolment.course_id);
          } catch (err) {
            progress = {
              course_id: enrolment.course_id,
              completed_lessons: 0,
              total_lessons: 0,
              percentage: 0,
            };
          }

          return { enrolment, course, progress };
        })
      );

      const validCourses = combined.filter((c): c is EnrolledCourse => c !== null);

      let completed = 0;
      let lessonsCompleted = 0;
      validCourses.forEach((c) => {
        if (c.progress?.percentage === 100) completed++;
        lessonsCompleted += c.progress?.completed_lessons ?? 0;
      });

      setCourses(validCourses);
      setStats({
        totalEnrolled: validCourses.length,
        totalCompleted: completed,
        totalLessonsCompleted: lessonsCompleted,
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.info.message : 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { courses, stats, loading, error, refetch: fetch };
}