from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.course import Course
from app.models.lesson import Lesson
from app.models.module import Module
from app.models.user import User
from app.models.instructor import Instructor


def get_course(session: Session, course_id: UUID) -> Course:
    course = session.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


def ensure_course_owner(session: Session, course_id: UUID, user: User) -> Course:
    course = get_course(session, course_id)
    if user.role == "administrator":
        return course
    if user.role != "teacher" or course.instructor_id != user.id:
        raise HTTPException(status_code=403, detail="You do not own this course")
    instructor = session.exec(select(Instructor).where(Instructor.user_id == user.id)).first()
    if not instructor or instructor.status != "approved":
        raise HTTPException(status_code=403, detail="Instructor approval is required for this action")
    return course


def ensure_lesson_access(session: Session, lesson_id: UUID, user: User) -> tuple[Lesson, Course]:
    lesson = session.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    module = session.get(Module, lesson.module_id)
    course = get_course(session, module.course_id)
    if user.role == "administrator":
        return lesson, course
    if user.role == "teacher" and course.instructor_id == user.id:
        instructor = session.exec(select(Instructor).where(Instructor.user_id == user.id)).first()
        if instructor and instructor.status == "approved":
            return lesson, course
    from app.models.enrolment import Enrolment

    if lesson.is_preview and course.status == "published":
        return lesson, course
    enrolment = session.exec(select(Enrolment).where(Enrolment.student_id == user.id, Enrolment.course_id == course.id, Enrolment.status == "active")).first()
    if not enrolment:
        raise HTTPException(status_code=403, detail="Active course enrolment required")
    return lesson, course


def create_course(session: Session, owner: User, **values: object) -> Course:
    if session.exec(select(Course).where(Course.slug == values.get("slug"))).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Course slug is already in use")
    category_id = values.get("category_id")
    if category_id is not None:
        from app.models.category import Category
        if not session.get(Category, category_id):
            raise HTTPException(status_code=404, detail="Course category not found")
    course = Course(instructor_id=owner.id, **values)
    session.add(course)
    session.commit()
    session.refresh(course)
    return course


def update_course(session: Session, course: Course, updates: dict[str, object]) -> Course:
    if updates.get("slug") != course.slug and session.exec(select(Course).where(Course.slug == updates.get("slug"))).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Course slug is already in use")
    category_id = updates.get("category_id")
    if category_id is not None:
        from app.models.category import Category
        if not session.get(Category, category_id):
            raise HTTPException(status_code=404, detail="Course category not found")
    if course.status == "published":
        course.status = "draft"
    for key, value in updates.items():
        setattr(course, key, value)
    session.add(course)
    session.commit()
    session.refresh(course)
    return course
