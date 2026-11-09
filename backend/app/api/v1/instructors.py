from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import select

from app.core.dependencies import CurrentUser, SessionDep
from app.core.permissions import require_roles
from app.models.instructor import Instructor
from app.models.user import User
from app.schemas.user import InstructorAdminRead
from app.services.instructor_service import review_teacher_registration

router = APIRouter(prefix="/instructors", tags=["instructors"])


def _admin_read(session: SessionDep, instructor: Instructor) -> InstructorAdminRead:
    user = session.get(User, instructor.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Teacher account not found")
    return InstructorAdminRead(
        id=instructor.id,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        bio=instructor.bio,
        qualifications=instructor.qualifications,
        status=instructor.status,
        review_reason=instructor.review_reason,
        reviewed_by=instructor.reviewed_by,
        reviewed_at=instructor.reviewed_at,
        created_at=instructor.created_at,
    )


@router.get("/applications", response_model=list[InstructorAdminRead], dependencies=[Depends(require_roles("administrator"))])
def pending(session: SessionDep) -> list[InstructorAdminRead]:
    """List pending teacher registrations for administrator review."""
    instructors = session.exec(select(Instructor).where(Instructor.status == "pending").order_by(Instructor.created_at)).all()
    return [_admin_read(session, instructor) for instructor in instructors]


@router.get("/registrations", response_model=list[InstructorAdminRead], dependencies=[Depends(require_roles("administrator"))])
def registrations(
    session: SessionDep,
    status_filter: str | None = Query(default=None, pattern="^(pending|approved|rejected)$"),
) -> list[InstructorAdminRead]:
    """List teacher registrations, optionally filtered by pending/approved/rejected status."""
    statement = select(Instructor).order_by(Instructor.created_at.desc())
    if status_filter:
        statement = statement.where(Instructor.status == status_filter)
    return [_admin_read(session, instructor) for instructor in session.exec(statement).all()]


@router.get("/registrations/{registration_id}", response_model=InstructorAdminRead, dependencies=[Depends(require_roles("administrator"))])
def registration_detail(registration_id: UUID, session: SessionDep) -> InstructorAdminRead:
    """Read teacher profile and review information without exposing account secrets."""
    instructor = session.get(Instructor, registration_id)
    if not instructor:
        raise HTTPException(status_code=404, detail="Teacher registration not found")
    return _admin_read(session, instructor)


@router.get("/{user_id}/profile")
def public_profile(user_id: UUID, session: SessionDep) -> dict[str, object]:
    profile = session.exec(select(Instructor).where(Instructor.user_id == user_id, Instructor.status == "approved")).first()
    user = session.get(User, user_id)
    if not profile or not user:
        raise HTTPException(status_code=404, detail="Instructor not found")
    return {"user_id": user.id, "full_name": user.full_name, "bio": profile.bio, "qualifications": profile.qualifications}


@router.post("/applications/{application_id}/review", response_model=InstructorAdminRead, dependencies=[Depends(require_roles("administrator"))])
def review(application_id: UUID, approved: bool, admin: CurrentUser, session: SessionDep, reason: str | None = None) -> InstructorAdminRead:
    """Approve or reject one pending teacher registration; only administrators may review."""
    instructor = review_teacher_registration(
        session,
        registration_id=application_id,
        administrator=admin,
        approved=approved,
        reason=reason,
    )
    return _admin_read(session, instructor)
