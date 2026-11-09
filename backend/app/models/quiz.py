from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import Column, JSON
from sqlmodel import Field, Relationship, SQLModel


class Quiz(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    lesson_id: UUID = Field(foreign_key="lesson.id", index=True)
    title: str = Field(max_length=200)
    passing_score: float = Field(default=60, ge=0, le=100)
    max_attempts: int = Field(default=3, ge=1)
    is_published: bool = False
    lesson: "Lesson" = Relationship(back_populates="quizzes")
    questions: list["Question"] = Relationship(back_populates="quiz")
    attempts: list["QuizAttempt"] = Relationship(back_populates="quiz")


class Question(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    quiz_id: UUID = Field(foreign_key="quiz.id", index=True)
    prompt: str
    question_type: str = "single_choice"
    choices: list[str] = Field(default_factory=list, sa_column=Column(JSON, nullable=False))
    correct_answers: list[int] = Field(default_factory=list, sa_column=Column(JSON, nullable=False))
    points: float = Field(default=1, gt=0)
    position: int = 0
    quiz: Quiz = Relationship(back_populates="questions")


class QuizAttempt(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    quiz_id: UUID = Field(foreign_key="quiz.id", index=True)
    student_id: UUID = Field(foreign_key="user.id", index=True)
    answers: dict[str, list[int]] = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    score: float = 0
    passed: bool = False
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    quiz: Quiz = Relationship(back_populates="attempts")
