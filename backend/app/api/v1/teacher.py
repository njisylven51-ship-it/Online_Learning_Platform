"""Teacher dashboard; authoring operations live in their feature routers."""
from fastapi import APIRouter, Depends
from sqlmodel import select

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
    courses = session.exec(select(Course).where(Course.instructor_id == user.id)).all()
    course_ids = {course.id for course in courses}
    enrolments = session.exec(select(Enrolment).where(Enrolment.course_id.in_(course_ids))).all() if course_ids else []
    pending = session.exec(select(AssignmentSubmission).join(Assignment, AssignmentSubmission.assignment_id == Assignment.id).join(Lesson, Assignment.lesson_id == Lesson.id).join(Module, Lesson.module_id == Module.id).where(Module.course_id.in_(course_ids), AssignmentSubmission.status == "submitted")).all() if course_ids else []
    return {"courses": len(courses), "enrolments": len(enrolments), "pending_submissions": len(pending)}
