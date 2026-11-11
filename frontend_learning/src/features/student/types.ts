import type { Course } from '../../courses/types';
import type { Enrolment } from '../../enrolments/types';
import type { CourseProgress } from '../../classroom/types';

export interface EnrolledCourse {
  enrolment: Enrolment;
  course: Course;
  progress: CourseProgress | null;
}