from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel


class Video(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    lesson_id: UUID = Field(foreign_key="lesson.id", index=True)
    uploaded_by: UUID = Field(foreign_key="user.id")
    provider: str = "cloudinary"
    public_id: str
    secure_url: str
    format: str
    size_bytes: int = Field(ge=0)
    duration_seconds: float = 0
    status: str = Field(default="processing", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    lesson: "Lesson" = Relationship(back_populates="videos")
    progress_records: list["VideoProgress"] = Relationship(back_populates="video")


class VideoProgress(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("video_id", "student_id", name="uq_video_student_progress"),)
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    video_id: UUID = Field(foreign_key="video.id", index=True)
    student_id: UUID = Field(foreign_key="user.id", index=True)
    position_seconds: int = Field(default=0, ge=0)
    furthest_position_seconds: int = Field(default=0, ge=0)
    watched_seconds: int = Field(default=0, ge=0)
    completed: bool = False
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    video: Video = Relationship(back_populates="progress_records")
