import json
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.secret import Secret
from app.services.ai_service import ask_ai

SYSTEM_PROMPT = """
You are a query intent classifier for a secrets manager called VaultFlow.
Given a natural language question, respond ONLY with JSON, no other text, no markdown.

The JSON must have this exact shape:
{
  "action": "list_secrets" or "count_secrets",
  "status_filter": "active" or "expired" or "revoked" or null,
  "expiring_within_days": a number or null
}

Examples:
"show me secrets expiring this week" -> {"action": "list_secrets", "status_filter": "active", "expiring_within_days": 7}
"how many secrets are expired" -> {"action": "count_secrets", "status_filter": "expired", "expiring_within_days": null}
"list all active secrets" -> {"action": "list_secrets", "status_filter": "active", "expiring_within_days": null}
"""


def run_natural_language_query(db: Session, question: str) -> dict:
    raw_response = ask_ai(SYSTEM_PROMPT, question)

    intent = json.loads(raw_response)

    query = db.query(Secret)

    if intent.get("status_filter"):
        query = query.filter(Secret.status == intent["status_filter"])

    if intent.get("expiring_within_days") is not None:
        from datetime import datetime, timedelta, timezone
        cutoff = datetime.now(timezone.utc) + timedelta(days=intent["expiring_within_days"])
        query = query.filter(Secret.expires_at <= cutoff)

    if intent["action"] == "count_secrets":
        count = query.count()
        return {"intent": intent, "result": {"count": count}}

    results = query.all()
    secrets_list = [
        {"id": str(s.id), "name": s.name, "status": s.status, "expires_at": s.expires_at.isoformat()}
        for s in results
    ]
    return {"intent": intent, "result": {"secrets": secrets_list}}