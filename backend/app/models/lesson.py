from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel


class Lesson(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    module_id: UUID = Field(foreign_key="module.id", index=True)
    title: str = Field(max_length=200)
    content: str = ""
    youtube_url: str | None = None
    duration_seconds: int = Field(default=0, ge=0)
    position: int = Field(default=0, ge=0)
    is_preview: bool = False
    module: "Module" = Relationship(back_populates="lessons")
    resources: list["Resource"] = Relationship(back_populates="lesson")
    videos: list["Video"] = Relationship(back_populates="lesson")
    quizzes: list["Quiz"] = Relationship(back_populates="lesson")
    assignments: list["Assignment"] = Relationship(back_populates="lesson")
    progress_records: list["Progress"] = Relationship(back_populates="lesson")
