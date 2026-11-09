from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select

from app.core.dependencies import CurrentUser, SessionDep
from app.core.permissions import require_approved_teacher_or_admin
from app.models.module import Module
from app.schemas.course import ModuleCreate
from app.services.course_service import ensure_course_owner

router = APIRouter(prefix="/courses/{course_id}/modules", tags=["modules"])


@router.get("")
def list_modules(course_id: UUID, session: SessionDep, user: CurrentUser) -> list[Module]:
    from app.services.course_service import get_course
    course = get_course(session, course_id)
    if user.role == "teacher" and course.instructor_id == user.id:
        ensure_course_owner(session, course_id, user)
    if course.status != "published" and (user.role == "student" or course.instructor_id != user.id):
        raise HTTPException(status_code=404, detail="Course not found")
    return list(session.exec(select(Module).where(Module.course_id == course_id).order_by(Module.position)).all())


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_approved_teacher_or_admin)])
def create_module(course_id: UUID, payload: ModuleCreate, user: CurrentUser, session: SessionDep) -> Module:
    ensure_course_owner(session, course_id, user)
    module = Module(course_id=course_id, **payload.model_dump())
    session.add(module)
    session.commit()
    session.refresh(module)
    return module


@router.patch("/{module_id}")
def update_module(course_id: UUID, module_id: UUID, payload: ModuleCreate, user: CurrentUser, session: SessionDep) -> Module:
    ensure_course_owner(session, course_id, user)
    module = session.get(Module, module_id)
    if not module or module.course_id != course_id:
        raise HTTPException(status_code=404, detail="Module not found")
    for key, value in payload.model_dump().items():
        setattr(module, key, value)
    session.add(module)
    session.commit()
    session.refresh(module)
    return module
