import uuid
import enum
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base


class NotificationType(str, enum.Enum):
    SECRET_EXPIRING = "secret_expiring"
    SECRET_EXPIRED = "secret_expired"
    SECRET_REVOKED = "secret_revoked"
    SECRET_CREATED = "secret_created"
    SYSTEM = "system"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("owners.id"), nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    related_secret_id = Column(
    UUID(as_uuid=True),
    ForeignKey("secrets.id", ondelete="SET NULL"),
    nullable=True,
)

    owner = relationship("Owner", back_populates="notifications")
