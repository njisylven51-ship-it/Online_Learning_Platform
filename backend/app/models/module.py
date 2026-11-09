from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel


class Module(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    course_id: UUID = Field(foreign_key="course.id", index=True)
    title: str = Field(max_length=200)
    description: str = ""
    position: int = Field(default=0, ge=0)
    course: "Course" = Relationship(back_populates="modules")
    lessons: list["Lesson"] = Relationship(back_populates="module")
