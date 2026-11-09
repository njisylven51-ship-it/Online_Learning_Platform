from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel


class Course(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    instructor_id: UUID = Field(foreign_key="user.id", index=True)
    category_id: UUID | None = Field(default=None, foreign_key="category.id")
    title: str = Field(max_length=200, index=True)
    slug: str = Field(max_length=220, unique=True, index=True)
    description: str = ""
    level: str = "beginner"
    price_xaf: int = Field(default=0, ge=0)
    status: str = Field(default="draft", index=True)
    rejection_reason: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    instructor: "User" = Relationship(back_populates="courses")
    category: Optional["Category"] = Relationship(back_populates="courses")
    modules: list["Module"] = Relationship(back_populates="course")
    enrolments: list["Enrolment"] = Relationship(back_populates="course")
    payments: list["Payment"] = Relationship(back_populates="course")
    certificates: list["Certificate"] = Relationship(back_populates="course")
