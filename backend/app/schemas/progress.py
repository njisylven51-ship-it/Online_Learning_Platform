from uuid import UUID
from pydantic import BaseModel, Field


class LessonProgressUpdate(BaseModel):
    completed: bool = False
    last_position_seconds: int = Field(default=0, ge=0)


class ProgressRead(BaseModel):
    course_id: UUID
    completed_lessons: int
    total_lessons: int
    percentage: float
