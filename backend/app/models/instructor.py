from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel


class Instructor(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", unique=True, index=True)
    bio: str = ""
    qualifications: str = ""
    status: str = Field(default="pending", index=True)
    review_reason: str | None = None
    reviewed_by: UUID | None = Field(default=None, foreign_key="user.id")
    reviewed_at: datetime | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    user: "User" = Relationship(
        back_populates="instructor_profile",
        sa_relationship_kwargs={"foreign_keys": "Instructor.user_id"},
    )
