import logging
from html import escape

from sqlmodel import Session

from app.integrations.email import send_email
from app.models.notification import Notification
from app.models.user import User

logger = logging.getLogger(__name__)


def notify_user(session: Session, user: User, title: str, message: str, *, email_subject: str | None = None) -> Notification:
    notification = Notification(user_id=user.id, title=title, message=message)
    session.add(notification)
    session.commit()
    session.refresh(notification)
    if email_subject:
        send_email(user.email, email_subject, f"<p>{escape(message)}</p>")
    return notification
