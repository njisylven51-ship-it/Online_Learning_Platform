from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserRead


class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=160)
    password: str = Field(min_length=10, max_length=128)


class TeacherRegisterRequest(RegisterRequest):
    bio: str = Field(min_length=20, max_length=4000, description="Professional biography shown on the instructor profile")
    qualifications: str = Field(min_length=5, max_length=2000, description="Qualifications or educational background")


class TeacherRegistrationResponse(BaseModel):
    """Safe response returned after creating a pending teacher account."""

    instructor_id: UUID
    user: UserRead
    instructor_status: str
    message: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
