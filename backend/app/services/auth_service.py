from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.models.instructor import Instructor
from app.services.notification_service import notify_user


def register_student(session: Session, *, email: str, full_name: str, password: str) -> User:
    email = email.lower().strip()
    if session.exec(select(User).where(User.email == email)).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered")
    user = User(email=email, full_name=full_name.strip(), password_hash=hash_password(password), role="student")
    session.add(user)
    session.commit()
    session.refresh(user)
    notify_user(session, user, "Welcome", "Your student account is ready.", email_subject="Welcome to the Computer Science Learning Platform")
    return user


def register_teacher(
    session: Session,
    *,
    email: str,
    full_name: str,
    password: str,
    bio: str,
    qualifications: str,
) -> tuple[User, Instructor]:
    email = email.lower().strip()
    if session.exec(select(User).where(User.email == email)).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered")

    user = User(
        email=email,
        full_name=full_name.strip(),
        password_hash=hash_password(password),
        role="teacher",
    )
    instructor = Instructor(user_id=user.id, bio=bio.strip(), qualifications=qualifications.strip(), status="pending")
    session.add(user)
    session.add(instructor)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered") from None
    session.refresh(user)
    session.refresh(instructor)
    _notify_registration(session, user)
    return user, instructor


def _notify_registration(session: Session, user: User) -> None:
    try:
        notify_user(
            session,
            user,
            "Teacher registration received",
            "Your teacher account is ready to use. Course authoring will be available after administrator approval.",
            email_subject="Teacher registration received",
        )
    except Exception:
        session.rollback()


def authenticate(session: Session, *, email: str, password: str) -> User:
    user = session.exec(select(User).where(User.email == email.lower().strip())).first()
    if not user or not verify_password(password, user.password_hash) or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    return user
