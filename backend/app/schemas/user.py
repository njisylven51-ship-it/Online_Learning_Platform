from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime


class CurrentUserRead(UserRead):
    instructor_status: str | None = None
    instructor_review_reason: str | None = None


class InstructorAdminRead(BaseModel):
    id: UUID
    user_id: UUID
    email: EmailStr
    full_name: str
    bio: str
    qualifications: str
    status: str
    review_reason: str | None
    reviewed_by: UUID | None
    reviewed_at: datetime | None
    created_at: datetime


class ProfileUpdate(BaseModel):
    full_name: str = Field(min_length=2, max_length=160)
