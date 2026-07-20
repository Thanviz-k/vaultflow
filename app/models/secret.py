import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, LargeBinary
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base


class Secret(Base):
    __tablename__ = "secrets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("owners.id"), nullable=False)
    status = Column(String, nullable=False, default="active")
    nonce = Column(
        LargeBinary,
        nullable=False,
    )
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    expires_at = Column(DateTime(timezone=True), nullable=True)
    last_accessed_at = Column(DateTime(timezone=True), nullable=True)
    encrypted_value = Column(
        LargeBinary,
        nullable=False,
    )
    owner = relationship("Owner", back_populates="secrets")

    audit_logs = relationship("AuditLog", back_populates="secret")
