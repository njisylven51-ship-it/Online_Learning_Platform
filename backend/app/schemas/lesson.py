from uuid import UUID

from pydantic import BaseModel, ConfigDict


class LessonRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    module_id: UUID
    title: str
    content: str
    youtube_url: str | None
    duration_seconds: int
    position: int
    is_preview: bool
