from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlmodel import select

from app.core.dependencies import CurrentUser, SessionDep
from app.core.permissions import require_roles
from app.models.audit_log import AuditLog
from app.models.category import Category
from app.models.user import User
from app.models.course import Course
from app.models.enrolment import Enrolment
from app.models.payment import Payment
from app.schemas.user import UserRead

router = APIRouter(prefix="/admin", tags=["administration"], dependencies=[Depends(require_roles("administrator"))])


class CategoryInput(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    description: str = ""


@router.get("/users", response_model=list[UserRead])
def users(session: SessionDep, limit: int = 50, offset: int = 0) -> list[User]:
    return list(session.exec(select(User).order_by(User.created_at.desc()).offset(max(offset, 0)).limit(min(max(limit, 1), 100))).all())


@router.get("/dashboard")
def dashboard(session: SessionDep) -> dict[str, int]:
    return {"users": len(session.exec(select(User)).all()), "courses_pending_review": len(session.exec(select(Course).where(Course.status == "pending_review")).all()), "active_enrolments": len(session.exec(select(Enrolment).where(Enrolment.status == "active")).all()), "payments_pending": len(session.exec(select(Payment).where(Payment.status == "pending")).all())}


@router.get("/courses")
def courses(session: SessionDep, status_filter: str | None = None, limit: int = 50, offset: int = 0) -> list[Course]:
    statement = select(Course)
    if status_filter:
        statement = statement.where(Course.status == status_filter)
    return list(session.exec(statement.order_by(Course.created_at.desc()).offset(max(offset, 0)).limit(min(max(limit, 1), 100))).all())


@router.patch("/users/{user_id}/status")
def set_user_status(user_id: UUID, active: bool, admin: CurrentUser, session: SessionDep) -> dict[str, bool]:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id and not active:
        raise HTTPException(status_code=400, detail="Administrators cannot deactivate their own account")
    user.is_active = active
    session.add(user)
    session.add(AuditLog(actor_id=admin.id, action="user_status_changed", entity_type="user", entity_id=user.id, details=f"active={active}"))
    session.commit()
    return {"active": user.is_active}


@router.post("/categories")
def create_category(payload: CategoryInput, session: SessionDep) -> Category:
    if session.exec(select(Category).where((Category.name == payload.name) | (Category.slug == payload.slug))).first():
        raise HTTPException(status_code=409, detail="Category name or slug is already in use")
    category = Category(**payload.model_dump())
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


@router.get("/audit-logs")
def audit_logs(session: SessionDep, limit: int = 100) -> list[AuditLog]:
    return list(session.exec(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(min(max(limit, 1), 200))).all())
