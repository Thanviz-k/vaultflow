import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    String,
    DateTime,
    LargeBinary,
    Boolean,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Owner(Base):
    __tablename__ = "owners"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    name = Column(
        String,
        nullable=False,
    )

    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    password_hash = Column(
        String,
        nullable=False,
    )

    vault_salt = Column(
        LargeBinary,
        nullable=True,
    )

    server_half = Column(
        LargeBinary,
        nullable=True,
    )

    key_hash = Column(
        String,
        nullable=True,
    )

    vault_initialized = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    secrets = relationship(
        "Secret",
        back_populates="owner",
    )
