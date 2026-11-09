from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CourseCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    slug: str = Field(min_length=3, max_length=220, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    description: str = ""
    category_id: UUID | None = None
    level: str = "beginner"
    price_xaf: int = Field(default=0, ge=0)


class CourseRead(CourseCreate):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    instructor_id: UUID
    status: str


class ModuleCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    description: str = ""
    position: int = Field(default=0, ge=0)


class LessonCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    content: str = ""
    youtube_url: str | None = None
    duration_seconds: int = Field(default=0, ge=0)
    position: int = Field(default=0, ge=0)
    is_preview: bool = False
