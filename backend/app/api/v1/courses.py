from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import select

from app.core.dependencies import CurrentUser, SessionDep
from app.core.permissions import require_approved_teacher_or_admin, require_roles
from app.models.course import Course
from app.models.category import Category
from app.models.user import User
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.course import CourseCreate, CourseRead
from app.services.course_service import create_course, ensure_course_owner, update_course

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("/categories")
def categories(session: SessionDep) -> list[Category]:
    return list(session.exec(select(Category).where(Category.is_active == True).order_by(Category.name)).all())


@router.get("/mine", response_model=list[CourseRead], dependencies=[Depends(require_approved_teacher_or_admin)])
def my_courses(user: CurrentUser, session: SessionDep) -> list[Course]:
    statement = select(Course)
    if user.role != "administrator":
        statement = statement.where(Course.instructor_id == user.id)
    return list(session.exec(statement.order_by(Course.updated_at.desc())).all())


@router.get("", response_model=list[CourseRead])
def list_courses(session: SessionDep, q: str | None = None, category_id: UUID | None = None, limit: int = Query(default=20, ge=1, le=100), offset: int = Query(default=0, ge=0)) -> list[Course]:
    statement = select(Course).where(Course.status == "published")
    if q:
        statement = statement.where(Course.title.ilike(f"%{q}%"))
    if category_id:
        statement = statement.where(Course.category_id == category_id)
    return list(session.exec(statement.order_by(Course.created_at.desc()).offset(offset).limit(limit)).all())


@router.get("/{course_id}", response_model=CourseRead)
def course_detail(course_id: UUID, session: SessionDep) -> Course:
    course = session.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.status != "published":
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.post("", response_model=CourseRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_approved_teacher_or_admin)])
def create(payload: CourseCreate, user: CurrentUser, session: SessionDep) -> Course:
    if user.role != "administrator":
        from app.models.instructor import Instructor

        instructor = session.exec(select(Instructor).where(Instructor.user_id == user.id, Instructor.status == "approved")).first()
        if not instructor:
            raise HTTPException(status_code=403, detail="Approved instructor profile required")
    return create_course(session, user, **payload.model_dump())


@router.patch("/{course_id}", response_model=CourseRead)
def update(course_id: UUID, payload: CourseCreate, user: CurrentUser, session: SessionDep) -> Course:
    course = ensure_course_owner(session, course_id, user)
    return update_course(session, course, payload.model_dump())


@router.post("/{course_id}/submit", response_model=CourseRead)
def submit_for_review(course_id: UUID, user: CurrentUser, session: SessionDep) -> Course:
    course = ensure_course_owner(session, course_id, user)
    if course.status not in ("draft", "rejected"):
        raise HTTPException(status_code=409, detail="Course cannot be submitted in its current state")
    course.status = "pending_review"
    session.add(course)
    session.commit()
    session.refresh(course)
    return course


@router.post("/{course_id}/archive", response_model=CourseRead)
def archive(course_id: UUID, user: CurrentUser, session: SessionDep) -> Course:
    course = ensure_course_owner(session, course_id, user)
    if course.status not in ("draft", "rejected", "published"):
        raise HTTPException(status_code=409, detail="Course cannot be archived in its current state")
    course.status = "archived"
    session.add(course)
    session.commit()
    session.refresh(course)
    return course


@router.post("/{course_id}/review", response_model=CourseRead, dependencies=[Depends(require_roles("administrator"))])
def review(course_id: UUID, approved: bool, admin: CurrentUser, session: SessionDep, reason: str | None = None) -> Course:
    course = session.get(Course, course_id)
    if not course or course.status != "pending_review":
        raise HTTPException(status_code=404, detail="Course awaiting review not found")
    course.status = "published" if approved else "rejected"
    course.rejection_reason = None if approved else (reason or "Please revise this course")
    session.add(course)
    session.add(AuditLog(actor_id=admin.id, action="course_reviewed", entity_type="course", entity_id=course.id, details=f"status={course.status}"))
    session.commit()
    session.refresh(course)
    instructor = session.get(User, course.instructor_id)
    from app.services.notification_service import notify_user
    notify_user(session, instructor, "Course review complete", f"Your course '{course.title}' was {course.status}.", email_subject="Course review update")
    return course
