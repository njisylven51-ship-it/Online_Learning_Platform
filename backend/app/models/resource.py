from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel


class Resource(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    lesson_id: UUID = Field(foreign_key="lesson.id", index=True)
    uploaded_by: UUID = Field(foreign_key="user.id")
    title: str = Field(max_length=200)
    resource_type: str
    storage_public_id: str
    secure_url: str
    mime_type: str
    size_bytes: int = Field(ge=0)
    status: str = "ready"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    lesson: "Lesson" = Relationship(back_populates="resources")
