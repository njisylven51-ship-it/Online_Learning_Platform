from datetime import UTC, datetime
from uuid import UUID

import jwt
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlmodel import select

from app.core.dependencies import CurrentUser, SessionDep
from app.core.config import settings
from app.core.security import create_access_token, create_password_reset_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TeacherRegisterRequest, TeacherRegistrationResponse, TokenResponse
from app.schemas.user import CurrentUserRead, ProfileUpdate, UserRead
from app.services.auth_service import authenticate, register_student, register_teacher
from app.models.instructor import Instructor

router = APIRouter(prefix="/auth", tags=["authentication"])


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    token: str
    new_password: str = Field(min_length=10, max_length=128)


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=10, max_length=128)


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register a student account",
    description="Creates an active student account. Any supplied role is ignored; clients cannot select a privileged role.",
    responses={409: {"description": "Email is already registered"}},
)
def register(payload: RegisterRequest, session: SessionDep) -> UserRead:
    return register_student(session, email=str(payload.email), full_name=payload.full_name, password=payload.password)


@router.post(
    "/register/teacher",
    response_model=TeacherRegistrationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a teacher account",
    description="Creates a teacher login and pending Instructor profile. Login is available immediately; authoring requires administrator approval.",
    responses={409: {"description": "Email is already registered"}},
)
def register_teacher_account(payload: TeacherRegisterRequest, session: SessionDep) -> TeacherRegistrationResponse:
    user, instructor = register_teacher(
        session,
        email=str(payload.email),
        full_name=payload.full_name,
        password=payload.password,
        bio=payload.bio,
        qualifications=payload.qualifications,
    )
    return TeacherRegistrationResponse(
        instructor_id=instructor.id,
        user=UserRead.model_validate(user),
        instructor_status=instructor.status,
        message="Teacher registration received. You can log in now; course authoring requires administrator approval.",
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, session: SessionDep) -> TokenResponse:
    user = authenticate(session, email=str(payload.email), password=payload.password)
    return TokenResponse(access_token=create_access_token(user.id, user.password_changed_at))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(_: CurrentUser) -> None:
    # Access tokens are short-lived and stateless; clients discard the token.
    return None


@router.get("/me", response_model=CurrentUserRead)
def me(user: CurrentUser, session: SessionDep) -> CurrentUserRead:
    instructor = session.exec(select(Instructor).where(Instructor.user_id == user.id)).first()
    return CurrentUserRead(
        **UserRead.model_validate(user).model_dump(),
        instructor_status=instructor.status if instructor else None,
        instructor_review_reason=instructor.review_reason if instructor else None,
    )


@router.patch("/me", response_model=UserRead)
def update_profile(payload: ProfileUpdate, user: CurrentUser, session: SessionDep) -> UserRead:
    user.full_name = payload.full_name.strip()
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/password-reset/request", status_code=status.HTTP_202_ACCEPTED)
def request_password_reset(payload: PasswordResetRequest, session: SessionDep) -> dict[str, str]:
    user = session.exec(select(User).where(User.email == str(payload.email).lower())).first()
    if user and user.is_active:
        token = create_password_reset_token(user.id)
        from app.integrations.email import send_email
        send_email(user.email, "Password reset", f"<p>Use this one-time link token to reset your password:</p><p>{token}</p>")
    return {"message": "If the account exists, password reset instructions have been sent"}


@router.post("/password-reset/confirm", status_code=status.HTTP_204_NO_CONTENT)
def confirm_password_reset(payload: PasswordReset, session: SessionDep) -> None:
    try:
        claims = jwt.decode(payload.token, settings.secret_key, algorithms=["HS256"])
        if claims.get("purpose") != "password_reset":
            raise ValueError("Wrong token purpose")
        user = session.get(User, UUID(claims["sub"]))
    except (jwt.PyJWTError, ValueError, KeyError):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token") from None
    if not user or not user.is_active:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    issued_at = int(claims.get("iat", 0))
    if user.password_changed_at and issued_at <= int(user.password_changed_at.timestamp()):
        raise HTTPException(status_code=400, detail="Reset token has already been used")
    user.password_hash = hash_password(payload.new_password)
    user.password_changed_at = datetime.now(UTC)
    session.add(user)
    session.commit()


@router.post("/password/change", status_code=status.HTTP_204_NO_CONTENT)
def change_password(payload: PasswordChange, user: CurrentUser, session: SessionDep) -> None:
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.password_hash = hash_password(payload.new_password)
    user.password_changed_at = datetime.now(UTC)
    session.add(user)
    session.commit()
