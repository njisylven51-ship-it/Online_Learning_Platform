from datetime import UTC, datetime
from uuid import UUID

from fastapi import HTTPException
from sqlmodel import Session

from app.models.audit_log import AuditLog
from app.models.instructor import Instructor
from app.models.user import User
from app.services.notification_service import notify_user


def review_teacher_registration(
    session: Session,
    *,
    registration_id: UUID,
    administrator: User,
    approved: bool,
    reason: str | None,
) -> Instructor:
    instructor = session.get(Instructor, registration_id)
    if not instructor or instructor.status != "pending":
        raise HTTPException(status_code=404, detail="Pending teacher registration not found")
    teacher = session.get(User, instructor.user_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher account not found")

    instructor.status = "approved" if approved else "rejected"
    instructor.review_reason = None if approved else (reason or "Application was not approved")
    instructor.reviewed_by = administrator.id
    instructor.reviewed_at = datetime.now(UTC)
    if approved:
        teacher.role = "teacher"
        session.add(teacher)

    session.add(instructor)
    session.add(AuditLog(
        actor_id=administrator.id,
        action="instructor_application_reviewed",
        entity_type="instructor",
        entity_id=instructor.id,
        details=f"status={instructor.status}; reason={instructor.review_reason or ''}",
    ))
    try:
        session.commit()
    except Exception:
        session.rollback()
        raise
    session.refresh(instructor)

    try:
        notify_user(
            session,
            teacher,
            "Teacher registration update",
            f"Your teacher registration was {instructor.status}. {instructor.review_reason or ''}",
            email_subject="Teacher registration update",
        )
    except Exception:
        session.rollback()
    return instructor
