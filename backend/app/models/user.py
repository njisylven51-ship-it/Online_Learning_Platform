from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.certificate import Certificate
    from app.models.course import Course
    from app.models.enrolment import Enrolment
    from app.models.instructor import Instructor
    from app.models.notification import Notification
    from app.models.payment import Payment
    from app.models.progress import Progress


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(index=True, unique=True, max_length=320)
    full_name: str = Field(max_length=160)
    password_hash: str
    role: str = Field(default="student", index=True)
    is_active: bool = True
    password_changed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)

    courses: list["Course"] = Relationship(back_populates="instructor")
    enrolments: list["Enrolment"] = Relationship(back_populates="student")
    payments: list["Payment"] = Relationship(back_populates="student")
    certificates: list["Certificate"] = Relationship(back_populates="student")
    progress_records: list["Progress"] = Relationship(back_populates="student")
    notifications: list["Notification"] = Relationship(back_populates="user")

    instructor_profile: Optional["Instructor"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"foreign_keys": "Instructor.user_id"},
    )