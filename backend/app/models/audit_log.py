from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class AuditLog(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    actor_id: UUID | None = Field(default=None, foreign_key="user.id", index=True)
    action: str = Field(index=True)
    entity_type: str
    entity_id: UUID | None = None
    details: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
