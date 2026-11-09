from uuid import UUID

from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.assignment import Assignment, AssignmentSubmission
from app.models.lesson import Lesson
from app.models.module import Module
from app.models.user import User
from app.services.course_service import ensure_course_owner, ensure_lesson_access
from app.services.notification_service import notify_user
from app.core.config import settings
from app.integrations.cloudinary import delete_resource, get_resource
from app.services.cloudinary_service import validate_public_id_scope, verify_asset_location


def submit(session: Session, assignment_id: UUID, student: User, text: str | None, file_public_id: str | None) -> AssignmentSubmission:
    assignment = session.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    ensure_lesson_access(session, assignment.lesson_id, student)
    if not (text and text.strip()) and not file_public_id:
        raise HTTPException(status_code=422, detail="Provide text or an uploaded file")
    file_url = None
    if file_public_id:
        validate_public_id_scope("assignment", str(student.id), file_public_id)
        asset = get_resource(file_public_id, "raw")
        canonical_public_id = str(asset.get("public_id", file_public_id))
        verify_asset_location("assignment", str(student.id), canonical_public_id, asset)
        if str(asset.get("format", "")).lower() != "pdf":
            delete_resource(canonical_public_id, "raw")
            raise HTTPException(status_code=415, detail="Assignment file must be a PDF")
        if int(asset.get("bytes", 0)) > settings.cloudinary_max_document_size:
            delete_resource(canonical_public_id, "raw")
            raise HTTPException(status_code=413, detail="Assignment file exceeds the configured size limit")
        file_url = str(asset["secure_url"])
        file_public_id = canonical_public_id
    submission = session.exec(select(AssignmentSubmission).where(AssignmentSubmission.assignment_id == assignment_id, AssignmentSubmission.student_id == student.id)).first()
    if submission and submission.status == "graded":
        raise HTTPException(status_code=409, detail="A graded submission cannot be replaced")
    if submission is None:
        submission = AssignmentSubmission(assignment_id=assignment_id, student_id=student.id)
    submission.text_submission = text
    submission.file_url = file_url
    submission.file_public_id = file_public_id
    submission.status = "submitted"
    session.add(submission)
    session.commit()
    session.refresh(submission)
    return submission


def grade(session: Session, submission_id: UUID, teacher: User, score: float, feedback: str) -> AssignmentSubmission:
    submission = session.get(AssignmentSubmission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    assignment = session.get(Assignment, submission.assignment_id)
    lesson = session.get(Lesson, assignment.lesson_id)
    module = session.get(Module, lesson.module_id)
    ensure_course_owner(session, module.course_id, teacher)
    if score > assignment.max_score:
        raise HTTPException(status_code=422, detail="Score exceeds assignment maximum")
    from datetime import datetime, timezone
    submission.score = score
    submission.feedback = feedback
    submission.status = "graded"
    submission.graded_at = datetime.now(timezone.utc)
    session.add(submission)
    session.commit()
    session.refresh(submission)
    student = session.get(User, submission.student_id)
    notify_user(session, student, "Assignment graded", f"Your submission for '{assignment.title}' was graded. Score: {score:g}/{assignment.max_score:g}. {feedback}", email_subject="Assignment feedback available")
    return submission
