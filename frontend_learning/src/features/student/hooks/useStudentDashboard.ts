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
      // 1. Fetch enrolments
      const enrolments = await enrolmentService.getMyEnrolments();
      const active = enrolments.filter((e) => e.is_active);

      // 2. Fetch course details and progress concurrently
      const combined = await Promise.all(
        active.map(async (enrolment) => {
          try {
            const [course, progress] = await Promise.all([
              courseService.getCourse(enrolment.course_id),
              classroomService.getCourseProgress(enrolment.course_id),
            ]);
            return { enrolment, course, progress };
          } catch {
            // If a course was deleted or unpublished, skip it gracefully
            return null;
          }
        })
      );

      // Filter out nulls (courses that failed to load)
      const validCourses = combined.filter((c): c is EnrolledCourse => c !== null);

      // 3. Calculate stats
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