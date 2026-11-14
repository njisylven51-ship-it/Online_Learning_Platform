from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlmodel import select
from app.models.course import Course
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.user import User

from app.core.dependencies import CurrentUser, SessionDep
from app.core.permissions import require_approved_teacher_or_admin, require_roles
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.lesson import Lesson
from app.models.module import Module
from app.schemas.assignment import AssignmentCreate, AssignmentGrade, AssignmentSubmit
from app.services.assignment_service import grade, submit
from app.services.cloudinary_service import upload_signature
from app.integrations.cloudinary import signed_delivery_url
from app.services.course_service import ensure_course_owner

router = APIRouter(prefix="/assignments", tags=["assignments"])


@router.post("/upload-signature", dependencies=[Depends(require_roles("student"))])
def assignment_upload_signature(user: CurrentUser) -> dict[str, object]:
    return upload_signature("assignment", str(user.id))


@router.post("/lessons/{lesson_id}", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_approved_teacher_or_admin)])
def create(lesson_id: UUID, payload: AssignmentCreate, user: CurrentUser, session: SessionDep) -> Assignment:
    lesson = session.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    module = session.get(Module, lesson.module_id)
    ensure_course_owner(session, module.course_id, user)
    assignment = Assignment(lesson_id=lesson_id, **payload.model_dump())
    session.add(assignment)
    session.commit()
    session.refresh(assignment)
    return assignment


@router.get("/lessons/{lesson_id}")
def list_lesson_assignments(lesson_id: UUID, user: CurrentUser, session: SessionDep) -> list[Assignment]:
    from app.services.course_service import ensure_lesson_access
    ensure_lesson_access(session, lesson_id, user)
    return list(session.exec(select(Assignment).where(Assignment.lesson_id == lesson_id)).all())


@router.post("/{assignment_id}/submissions", dependencies=[Depends(require_roles("student"))])
def create_submission(assignment_id: UUID, payload: AssignmentSubmit, user: CurrentUser, session: SessionDep) -> AssignmentSubmission:
    return submit(session, assignment_id, user, payload.text_submission, payload.file_public_id)


@router.get("/submissions/{submission_id}/file")
def download_submission_file(submission_id: UUID, user: CurrentUser, session: SessionDep) -> RedirectResponse:
    submission = session.get(AssignmentSubmission, submission_id)
    if not submission or not submission.file_public_id:
        raise HTTPException(status_code=404, detail="Submission file not found")
    assignment = session.get(Assignment, submission.assignment_id)
    lesson = session.get(Lesson, assignment.lesson_id)
    module = session.get(Module, lesson.module_id)
    from app.models.course import Course
    course = session.get(Course, module.course_id)
    if submission.student_id != user.id and (user.role != "administrator" and course.instructor_id != user.id):
        raise HTTPException(status_code=404, detail="Submission file not found")
    url = signed_delivery_url(submission.file_public_id, "pdf", "raw")
    return RedirectResponse(url, status_code=307)


@router.post("/submissions/{submission_id}/grade", dependencies=[Depends(require_approved_teacher_or_admin)])
def grade_submission(submission_id: UUID, payload: AssignmentGrade, user: CurrentUser, session: SessionDep) -> AssignmentSubmission:
    return grade(session, submission_id, user, payload.score, payload.feedback)


@router.get("/me/submissions", dependencies=[Depends(require_roles("student"))])
def my_submissions(user: CurrentUser, session: SessionDep) -> list[AssignmentSubmission]:
    return list(session.exec(select(AssignmentSubmission).where(AssignmentSubmission.student_id == user.id).order_by(AssignmentSubmission.submitted_at.desc())).all())

@router.get("/submissions/mine")
def get_teacher_submissions(user: CurrentUser, session: SessionDep):
    if user.role not in ["teacher", "administrator"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    from sqlmodel import select
    
    # Join Submission -> Assignment -> User -> Lesson -> Module -> Course
    statement = select(AssignmentSubmission, Assignment, User).join(
        Assignment, AssignmentSubmission.assignment_id == Assignment.id
    ).join(
        User, AssignmentSubmission.student_id == User.id
    ).join(
        Lesson, Assignment.lesson_id == Lesson.id
    ).join(
        Module, Lesson.module_id == Module.id
    ).join(
        Course, Module.course_id == Course.id
    ).where(Course.instructor_id == user.id)
    
    results = session.exec(statement).all()
    
    return [
        {
            "id": str(sub.id),
            "assignment_id": str(sub.assignment_id),
            "student_id": str(sub.student_id),
            "text": sub.text_submission,  # <-- FIXED: Maps to the correct DB field
            "file_public_id": sub.file_public_id,
            "score": sub.score,
            "feedback": sub.feedback,
            "status": sub.status,
            "submitted_at": sub.submitted_at.isoformat() if sub.submitted_at else None,
            "assignment_title": assignment.title,
            "student_name": student.full_name,
        }
        for sub, assignment, student in results
    ]
