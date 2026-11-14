from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


class VideoProgressUpdate(BaseModel):
    position_seconds: int = Field(ge=0)
    duration_seconds: float | None = None  # <-- ADDED: Fallback



class VideoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    public_id: str
    format: str
    status: str
    duration_seconds: float