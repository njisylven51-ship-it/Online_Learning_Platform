from uuid import UUID

from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.course import Course
from app.models.enrolment import Enrolment
from app.models.user import User
from app.services.notification_service import notify_user


def enrol_free_course(session: Session, student: User, course_id: UUID) -> Enrolment:
    course = session.get(Course, course_id)
    if not course or course.status != "published":
        raise HTTPException(status_code=404, detail="Published course not found")
    if course.price_xaf > 0:
        raise HTTPException(status_code=402, detail="This course requires verified payment")
    existing = session.exec(select(Enrolment).where(Enrolment.student_id == student.id, Enrolment.course_id == course_id)).first()
    if existing:
        if existing.status != "active":
            existing.status = "active"
            session.add(existing)
            session.commit()
        return existing
    enrolment = Enrolment(student_id=student.id, course_id=course_id, status="active")
    session.add(enrolment)
    session.commit()
    session.refresh(enrolment)
    notify_user(session, student, "Course enrolment confirmed", f"You are enrolled in {course.title}.", email_subject="Course enrolment confirmed")
    return enrolment
