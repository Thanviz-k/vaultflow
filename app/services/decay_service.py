from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.services.audit_service import log_action
from app.models.secret import Secret


def expire_overdue_secrets(db: Session) -> int:
    now = datetime.now(timezone.utc)

    overdue_secrets = (
        db.query(Secret)
        .filter(Secret.expires_at < now, Secret.status == "active")
        .all()
    )

    count = 0
    for secret in overdue_secrets:
        secret.status = "expired"
        log_action(db, secret_id=secret.id, action="expired")
        count += 1

    db.commit()
    return count
