from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.services.audit_service import log_action
from app.models.secret import Secret
from app.models.notification import Notification, NotificationType


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


def notify_expiring_secrets(db: Session) -> int:
    now = datetime.now(timezone.utc)
    window_end = now + timedelta(hours=24)

    expiring_secrets = (
        db.query(Secret)
        .filter(
            Secret.status == "active",
            Secret.expires_at >= now,
            Secret.expires_at <= window_end,
        )
        .all()
    )

    count = 0
    for secret in expiring_secrets:
        already_notified = (
            db.query(Notification)
            .filter(
                Notification.related_secret_id == secret.id,
                Notification.type == NotificationType.SECRET_EXPIRING,
            )
            .first()
        )
        if already_notified:
            continue

        db.add(
            Notification(
                owner_id=secret.owner_id,
                type=NotificationType.SECRET_EXPIRING,
                title="Secret expiring soon",
                message=f"'{secret.name}' expires within 24 hours.",
                related_secret_id=secret.id,
            )
        )
        count += 1

    db.commit()
    return count
