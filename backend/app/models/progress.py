from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel


class Progress(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("student_id", "lesson_id", name="uq_student_lesson_progress"),)
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    student_id: UUID = Field(foreign_key="user.id", index=True)
    course_id: UUID = Field(foreign_key="course.id", index=True)
    lesson_id: UUID = Field(foreign_key="lesson.id", index=True)
    completed: bool = False
    last_position_seconds: int = Field(default=0, ge=0)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    student: "User" = Relationship(back_populates="progress_records")
    course: "Course" = Relationship()
    lesson: "Lesson" = Relationship(back_populates="progress_records")
