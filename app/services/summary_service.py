from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.secret import Secret
from app.services.ai_service import ask_ai

SYSTEM_PROMPT = """
You are a security analyst summarizing audit log activity
for a secrets manager called VaultFlow.

Given a list of audit log entries, write a short, clear
summary of 3-5 sentences for a non-technical owner.

Mention notable patterns such as:
- secret creation
- verification activity
- revocations
- expirations
- unusual activity

Do not use markdown formatting.
Write in plain sentences.
"""


def summarize_recent_activity(
    db: Session,
    owner_id,
    days: int = 7,
) -> str:

    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    logs = (
        db.query(AuditLog, Secret)
        .join(
            Secret,
            AuditLog.secret_id == Secret.id,
        )
        .filter(
            Secret.owner_id == owner_id,
            AuditLog.timestamp >= cutoff,
        )
        .order_by(AuditLog.timestamp.desc())
        .all()
    )

    if not logs:
        return f"No activity in the last " f"{days} days."

    log_lines = [
        (
            f"- {log.action} on secret "
            f"'{secret.name}' at "
            f"{log.timestamp.isoformat()}"
        )
        for log, secret in logs
    ]

    log_text = "\n".join(log_lines)

    summary = ask_ai(
        SYSTEM_PROMPT,
        ("Here is the audit log activity:\n" f"{log_text}"),
    )

    return summary
