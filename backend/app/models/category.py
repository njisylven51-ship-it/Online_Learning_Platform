from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel


class Category(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(max_length=100, unique=True, index=True)
    slug: str = Field(max_length=120, unique=True, index=True)
    description: str = ""
    is_active: bool = True
    courses: list["Course"] = Relationship(back_populates="category")
