from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(index=True, unique=True, max_length=320)
    full_name: str = Field(max_length=160)
    password_hash: str
    role: str = Field(default="student", index=True)
    is_active: bool = True
    password_changed_at: datetime | None = None
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)
    courses: list["Course"] = Relationship(back_populates="instructor")
    enrolments: list["Enrolment"] = Relationship(back_populates="student")
    payments: list["Payment"] = Relationship(back_populates="student")
    certificates: list["Certificate"] = Relationship(back_populates="student")
    progress_records: list["Progress"] = Relationship(back_populates="student")
    notifications: list["Notification"] = Relationship(back_populates="user")
    instructor_profile: "Instructor | None" = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"foreign_keys": "Instructor.user_id"},
    )
