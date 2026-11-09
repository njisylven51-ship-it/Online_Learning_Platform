from uuid import UUID, uuid4

from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.certificate import Certificate
from app.models.course import Course
from app.models.lesson import Lesson
from app.models.module import Module
from app.models.progress import Progress
from app.models.user import User


def issue_certificate(session: Session, student: User, course_id: UUID) -> Certificate:
    course = session.get(Course, course_id)
    if not course or course.status != "published":
        raise HTTPException(status_code=404, detail="Published course not found")
    from app.models.enrolment import Enrolment
    enrolment = session.exec(select(Enrolment).where(Enrolment.student_id == student.id, Enrolment.course_id == course_id, Enrolment.status == "active")).first()
    if not enrolment:
        raise HTTPException(status_code=403, detail="Active course enrolment required")
    modules = session.exec(select(Module).where(Module.course_id == course_id)).all()
    lessons = [lesson for module in modules for lesson in session.exec(select(Lesson).where(Lesson.module_id == module.id)).all()]
    if not lessons:
        raise HTTPException(status_code=409, detail="Course has no lessons")
    completed = session.exec(select(Progress).where(Progress.student_id == student.id, Progress.course_id == course_id, Progress.completed == True)).all()
    if len({progress.lesson_id for progress in completed}) < len(lessons):
        raise HTTPException(status_code=403, detail="Complete all course lessons to earn a certificate")
    existing = session.exec(select(Certificate).where(Certificate.student_id == student.id, Certificate.course_id == course_id)).first()
    if existing:
        if existing.revoked:
            raise HTTPException(status_code=403, detail="This certificate was revoked")
        return existing
    certificate = Certificate(student_id=student.id, course_id=course_id, certificate_code=str(uuid4()).upper())
    session.add(certificate)
    session.commit()
    session.refresh(certificate)
    return certificate
