from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel


class Payment(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("provider", "provider_reference", name="uq_provider_reference"),)
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    student_id: UUID = Field(foreign_key="user.id", index=True)
    course_id: UUID = Field(foreign_key="course.id", index=True)
    provider: str
    phone_number: str = Field(max_length=16)
    provider_reference: str = Field(index=True)
    amount_xaf: int = Field(gt=0)
    currency: str = "XAF"
    status: str = Field(default="pending", index=True)
    is_simulated: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    verified_at: datetime | None = None
    student: "User" = Relationship(back_populates="payments")
    course: "Course" = Relationship(back_populates="payments")
