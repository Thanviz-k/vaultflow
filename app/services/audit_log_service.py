from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.secret import Secret


def get_audit_logs(db: Session, owner_id):
    return (
        db.query(AuditLog)
        .join(Secret, AuditLog.secret_id == Secret.id)
        .filter(Secret.owner_id == owner_id)
        .order_by(AuditLog.timestamp.desc())
        .all()
    )