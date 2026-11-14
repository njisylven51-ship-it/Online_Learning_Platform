"""Teacher dashboard; authoring operations live in their feature routers."""
from fastapi import APIRouter, Depends
from sqlmodel import select, func

from app.core.dependencies import CurrentUser, SessionDep
from app.core.permissions import require_approved_teacher_or_admin
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.course import Course
from app.models.enrolment import Enrolment
from app.models.lesson import Lesson
from app.models.module import Module

router = APIRouter(prefix="/teacher", tags=["teacher"])


@router.get("/dashboard", dependencies=[Depends(require_approved_teacher_or_admin)])
def dashboard(user: CurrentUser, session: SessionDep) -> dict[str, int]:
    # 1. Total number of courses owned by this teacher
    total_courses = session.exec(
        select(func.count(Course.id)).where(Course.instructor_id == user.id)
    ).one()

    # 2. Distinct students enrolled in ANY of this teacher's courses
    total_students = session.exec(
        select(func.count(func.distinct(Enrolment.student_id)))
        .join(Course, Enrolment.course_id == Course.id)
        .where(Course.instructor_id == user.id)
    ).one()

    # 3. Pending assignment submissions awaiting grading
    pending_reviews = session.exec(
        select(func.count(AssignmentSubmission.id))
        .join(Assignment, AssignmentSubmission.assignment_id == Assignment.id)
        .join(Lesson, Assignment.lesson_id == Lesson.id)
        .join(Module, Lesson.module_id == Module.id)
        .join(Course, Module.course_id == Course.id)
        .where(
            Course.instructor_id == user.id,
            AssignmentSubmission.status == "submitted",
        )
    ).one()

    return {
        "total_courses": total_courses,
        "total_students": total_students,
        "pending_reviews": pending_reviews,
    }