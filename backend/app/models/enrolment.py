from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel


class Enrolment(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("student_id", "course_id", name="uq_student_course_enrolment"),)
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    student_id: UUID = Field(foreign_key="user.id", index=True)
    course_id: UUID = Field(foreign_key="course.id", index=True)
    status: str = Field(default="active", index=True)
    enrolled_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    student: "User" = Relationship(back_populates="enrolments")
    course: "Course" = Relationship(back_populates="enrolments")
