from fastapi import APIRouter
from sqlmodel import select

from app.core.dependencies import CurrentUser, SessionDep
from app.models.notification import Notification

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me/notifications")
def notifications(user: CurrentUser, session: SessionDep) -> list[Notification]:
    return list(session.exec(select(Notification).where(Notification.user_id == user.id).order_by(Notification.created_at.desc()).limit(100)).all())
