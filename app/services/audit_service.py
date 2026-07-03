from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog


def log_action(db: Session, secret_id, action: str, metadata: dict | None = None):
    entry = AuditLog(
        secret_id=secret_id,
        action=action,
        metadata_=metadata,
    )
    db.add(entry)
    db.commit()