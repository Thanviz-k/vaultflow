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


def _parse_intent(raw_response: str) -> dict:
    """
    The model is asked to return raw JSON, but sometimes wraps it in a
    ```json ... ``` code fence anyway. Strip that before parsing, and fall
    back to a safe default instead of blowing up the whole request if the
    model returns something unparsable.
    """

    text = raw_response.strip()

    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
        text = text.strip()

    try:
        intent = json.loads(text)
        if not isinstance(intent, dict):
            raise ValueError("AI response was valid JSON but not an object")
    except (json.JSONDecodeError, TypeError, ValueError):
        intent = {
            "action": "list_secrets",
            "status_filter": None,
            "expiring_within_days": None,
        }

    intent.setdefault("action", "list_secrets")
    intent.setdefault("status_filter", None)
    intent.setdefault("expiring_within_days", None)

    if intent.get("status_filter") not in (None, "active", "expired", "revoked"):
        intent["status_filter"] = None

    return intent


def _build_answer(intent: dict, result: dict) -> str:
    """Turn the structured intent/result into a short natural-language reply."""

    status = intent.get("status_filter")
    days = intent.get("expiring_within_days")

    scope = f"{status} " if status else ""
    if days is not None:
        scope += f"expiring within {days} day(s) "

    if intent.get("action") == "count_secrets":
        count = result["count"]
        noun = "secret" if count == 1 else "secrets"
        return f"You have {count} {scope}{noun}.".replace("  ", " ")

    secrets_list = result["secrets"]

    if not secrets_list:
        return f"No {scope}secrets found.".replace("  ", " ")

    lines = [f"Found {len(secrets_list)} {scope}secret(s):".replace("  ", " ")]

    for secret in secrets_list:
        expiry = secret["expires_at"] or "no expiry"
        lines.append(f"• {secret['name']} — {secret['status']} (expires: {expiry})")

    return "\n".join(lines)


def run_natural_language_query(
    db: Session,
    question: str,
    owner_id,
) -> dict:

    raw_response = ask_ai(
        SYSTEM_PROMPT,
        question,
    )

    intent = _parse_intent(raw_response)

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
        result = {"count": count}

        return {
            "answer": _build_answer(intent, result),
            "intent": intent,
            "result": result,
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

    result = {"secrets": secrets_list}

    return {
        "answer": _build_answer(intent, result),
        "intent": intent,
        "result": result,
    }
