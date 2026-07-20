import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    secret_id = Column(UUID(as_uuid=True), ForeignKey("secrets.id"), nullable=False)
    action = Column(String, nullable=False)
    timestamp = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    metadata_ = Column("metadata", JSONB, nullable=True)

    secret = relationship("Secret", back_populates="audit_logs")
