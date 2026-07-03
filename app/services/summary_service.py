from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.services.ai_service import ask_ai

SYSTEM_PROMPT = """
You are a security analyst summarizing audit log activity for a secrets manager called VaultFlow.
Given a list of audit log entries, write a short, clear summary (3-5 sentences) for a non-technical owner.
Mention any notable patterns, like many verifications, expirations, or unusual activity.
Do not use markdown formatting. Write in plain sentences.
"""


def summarize_recent_activity(db: Session, days: int = 7) -> str:
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    logs = (
        db.query(AuditLog)
        .filter(AuditLog.timestamp >= cutoff)
        .order_by(AuditLog.timestamp.desc())
        .all()
    )

    if not logs:
        return f"No activity in the last {days} days."

    log_lines = [
        f"- {log.action} on secret {log.secret_id} at {log.timestamp.isoformat()}"
        for log in logs
    ]
    log_text = "\n".join(log_lines)

    summary = ask_ai(SYSTEM_PROMPT, f"Here is the audit log activity:\n{log_text}")
    return summary