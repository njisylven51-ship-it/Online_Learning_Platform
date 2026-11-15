from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel


class CourseThumbnail(SQLModel, table=True):
    __tablename__ = "course_thumbnail"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    course_id: UUID = Field(foreign_key="course.id", unique=True, index=True)
    public_id: str
    format: str
    bytes: int
    status: str = Field(default="ready")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    course: "Course" = Relationship(back_populates="thumbnail")
