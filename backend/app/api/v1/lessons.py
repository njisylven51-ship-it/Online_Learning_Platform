from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select

from app.core.dependencies import CurrentUser, SessionDep
from app.core.permissions import require_approved_teacher_or_admin
from app.models.lesson import Lesson
from app.models.module import Module
from app.models.enrolment import Enrolment
from app.schemas.course import LessonCreate
from app.schemas.lesson import LessonRead
from app.services.course_service import ensure_course_owner, ensure_lesson_access

router = APIRouter(tags=["lessons"])


@router.get("/modules/{module_id}/lessons", response_model=list[LessonRead])
def list_lessons(module_id: UUID, user: CurrentUser, session: SessionDep) -> list[Lesson]:
    module = session.get(Module, module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    from app.models.course import Course
    course = session.get(Course, module.course_id)
    if user.role == "teacher" and course.instructor_id == user.id:
        ensure_course_owner(session, course.id, user)
    if user.role == "administrator" or course.instructor_id == user.id:
        return list(session.exec(select(Lesson).where(Lesson.module_id == module_id).order_by(Lesson.position)).all())
    if course.status != "published":
        raise HTTPException(status_code=404, detail="Module not found")
    enrolment = session.exec(select(Enrolment).where(Enrolment.student_id == user.id, Enrolment.course_id == course.id, Enrolment.status == "active")).first()
    query = select(Lesson).where(Lesson.module_id == module_id).order_by(Lesson.position)
    if not enrolment:
        query = query.where(Lesson.is_preview == True)
    return list(session.exec(query).all())


@router.post("/modules/{module_id}/lessons", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_approved_teacher_or_admin)])
def create_lesson(module_id: UUID, payload: LessonCreate, user: CurrentUser, session: SessionDep) -> Lesson:
    module = session.get(Module, module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    ensure_course_owner(session, module.course_id, user)
    lesson = Lesson(module_id=module.id, **payload.model_dump())
    session.add(lesson)
    session.commit()
    session.refresh(lesson)
    return lesson


@router.patch("/lessons/{lesson_id}", response_model=LessonRead)
def update_lesson(lesson_id: UUID, payload: LessonCreate, user: CurrentUser, session: SessionDep) -> Lesson:
    lesson = session.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    module = session.get(Module, lesson.module_id)
    ensure_course_owner(session, module.course_id, user)
    for key, value in payload.model_dump().items():
        setattr(lesson, key, value)
    session.add(lesson)
    session.commit()
    session.refresh(lesson)
    return lesson


@router.get("/lessons/{lesson_id}", response_model=LessonRead)
def get_lesson(lesson_id: UUID, user: CurrentUser, session: SessionDep) -> Lesson:
    lesson, _ = ensure_lesson_access(session, lesson_id, user)
    return lesson
