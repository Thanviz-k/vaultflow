from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from database import SessionLocal
from models import Secret, Notification, NotificationType

def check_expiring_secrets():
    db = SessionLocal()
    soon = datetime.utcnow() + timedelta(days=3)
    expiring = db.query(Secret).filter(
        Secret.expires_at <= soon,
        Secret.expires_at > datetime.utcnow(),
        Secret.status == "active",
    ).all()

    for secret in expiring:
        exists = db.query(Notification).filter(
            Notification.related_secret_id == secret.id,
            Notification.type == NotificationType.SECRET_EXPIRING,
        ).first()
        if not exists:
            db.add(Notification(
                user_id=secret.user_id,
                type=NotificationType.SECRET_EXPIRING,
                title="Secret expiring soon",
                message=f"'{secret.name}' expires on {secret.expires_at.strftime('%d %b %Y')}.",
                related_secret_id=secret.id,
            ))
    db.commit()
    db.close()

scheduler = BackgroundScheduler()
scheduler.add_job(check_expiring_secrets, "interval", hours=6)
