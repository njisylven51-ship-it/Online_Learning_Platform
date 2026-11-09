from collections.abc import Callable

from typing import Annotated
from fastapi import Depends, HTTPException, status

from app.core.dependencies import CurrentUser, SessionDep, get_current_user
from app.models.instructor import Instructor
from app.models.user import User
from sqlmodel import select


def require_roles(*roles: str) -> Callable[..., User]:
    def check(user: Annotated[User, Depends(get_current_user)]) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return check


def ensure_owner(owner_id: object, user: User) -> None:
    if user.role != "administrator" and owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this resource")


def require_approved_teacher_or_admin(user: CurrentUser, session: SessionDep) -> User:
    """Require an active authenticated teacher with an approved profile, or an administrator."""
    if user.role == "administrator":
        return user
    if user.role != "teacher":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Teacher or administrator access required")
    instructor = session.exec(select(Instructor).where(Instructor.user_id == user.id)).first()
    if not instructor or instructor.status != "approved":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Instructor approval is required for this action")
    return user
