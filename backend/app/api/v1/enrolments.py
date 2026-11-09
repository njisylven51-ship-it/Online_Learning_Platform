from fastapi import APIRouter, Depends, status
from sqlmodel import select

from app.core.dependencies import CurrentUser, SessionDep
from app.core.permissions import require_roles
from app.models.enrolment import Enrolment
from app.models.user import User
from app.services.enrolment_service import enrol_free_course

router = APIRouter(prefix="/enrolments", tags=["enrolments"])


@router.post("/{course_id}", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_roles("student"))])
def enrol(course_id: __import__("uuid").UUID, user: CurrentUser, session: SessionDep) -> Enrolment:
    return enrol_free_course(session, user, course_id)


@router.get("/me")
def my_enrolments(user: CurrentUser, session: SessionDep) -> list[Enrolment]:
    return list(session.exec(select(Enrolment).where(Enrolment.student_id == user.id).order_by(Enrolment.enrolled_at.desc())).all())
