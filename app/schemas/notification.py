from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID


class NotificationOut(BaseModel):
    id: UUID
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime
    related_secret_id: Optional[UUID] = None

    class Config:
        from_attributes = True


class NotificationSummary(BaseModel):
    unread_count: int
    notifications: list[NotificationOut]
