from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    id: UUID
    secret_id: UUID
    secret_name: str | None
    action: str
    timestamp: datetime
    metadata_: dict | None = None

    model_config = ConfigDict(from_attributes=True)