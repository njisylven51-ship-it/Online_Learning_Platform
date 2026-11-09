from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel


class Assignment(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    lesson_id: UUID = Field(foreign_key="lesson.id", index=True)
    title: str = Field(max_length=200)
    instructions: str
    due_at: datetime | None = None
    max_score: float = Field(default=100, gt=0)
    lesson: "Lesson" = Relationship(back_populates="assignments")
    submissions: list["AssignmentSubmission"] = Relationship(back_populates="assignment")


class AssignmentSubmission(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("assignment_id", "student_id", name="uq_assignment_student_submission"),)
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    assignment_id: UUID = Field(foreign_key="assignment.id", index=True)
    student_id: UUID = Field(foreign_key="user.id", index=True)
    text_submission: str | None = None
    file_url: str | None = None
    file_public_id: str | None = None
    score: float | None = None
    feedback: str | None = None
    status: str = "submitted"
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    graded_at: datetime | None = None
    assignment: Assignment = Relationship(back_populates="submissions")
