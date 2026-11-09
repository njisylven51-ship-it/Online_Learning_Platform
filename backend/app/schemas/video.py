from uuid import UUID
from pydantic import BaseModel, Field


class VideoProgressUpdate(BaseModel):
    position_seconds: int = Field(ge=0)
