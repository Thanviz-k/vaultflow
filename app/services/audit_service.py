from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def log_action(
    db: Session,
    secret_id,
    secret_name: str,
    action: str,
    metadata: dict | None = None,
):
    entry = AuditLog(
    secret_id=secret_id,
    secret_name=secret_name,
    action=action,
    metadata_=metadata,
)

    db.add(entry)

    return entry
