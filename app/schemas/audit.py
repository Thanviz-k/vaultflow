from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AuditResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    secret_id: UUID
    action: str
    timestamp: datetime
    metadata_: dict | None = None
