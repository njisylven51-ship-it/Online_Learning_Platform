from datetime import datetime
from pydantic import BaseModel, Field


class AssignmentCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    instructions: str = Field(min_length=1)
    due_at: datetime | None = None
    max_score: float = Field(default=100, gt=0)


class AssignmentSubmit(BaseModel):
    text_submission: str | None = None
    file_public_id: str | None = None


class AssignmentGrade(BaseModel):
    score: float = Field(ge=0)
    feedback: str = ""
