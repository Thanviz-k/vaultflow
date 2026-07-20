import json
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.secret import Secret
from app.services.ai_service import ask_ai

SYSTEM_PROMPT = """
You are a query intent classifier for a secrets manager called VaultFlow.

Given a natural language question, respond ONLY with JSON.
Do not return markdown or any other text.

The JSON must have this exact shape:

{
  "action": "list_secrets" or "count_secrets",
  "status_filter": "active" or "expired" or "revoked" or null,
  "expiring_within_days": a number or null
}

Examples:

"show me secrets expiring this week"
->
{"action": "list_secrets", "status_filter": "active", "expiring_within_days": 7}

"how many secrets are expired"
->
{"action": "count_secrets", "status_filter": "expired", "expiring_within_days": null}

"list all active secrets"
->
{"action": "list_secrets", "status_filter": "active", "expiring_within_days": null}
"""


def run_natural_language_query(
    db: Session,
    question: str,
    owner_id,
) -> dict:

    raw_response = ask_ai(
        SYSTEM_PROMPT,
        question,
    )

    intent = json.loads(raw_response)

    # Start with ONLY this owner's secrets

    query = db.query(Secret).filter(Secret.owner_id == owner_id)

    # STATUS FILTER

    if intent.get("status_filter"):
        query = query.filter(Secret.status == intent["status_filter"])

    # EXPIRY FILTER

    if intent.get("expiring_within_days") is not None:
        days = int(intent["expiring_within_days"])

        now = datetime.now(timezone.utc)

        cutoff = now + timedelta(days=days)

        query = query.filter(
            Secret.expires_at.isnot(None),
            Secret.expires_at >= now,
            Secret.expires_at <= cutoff,
        )

    # COUNT

    if intent.get("action") == "count_secrets":
        count = query.count()

        return {
            "intent": intent,
            "result": {"count": count},
        }

    # LIST

    results = query.all()

    secrets_list = [
        {
            "id": str(secret.id),
            "name": secret.name,
            "status": secret.status,
            "expires_at": (
                secret.expires_at.isoformat() if secret.expires_at else None
            ),
        }
        for secret in results
    ]

    return {
        "intent": intent,
        "result": {"secrets": secrets_list},
    }
