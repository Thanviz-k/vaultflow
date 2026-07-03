from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.services.audit_service import log_action
from app.models.secret import Secret
from app.services.key_service import generate_key_pair
from app.services.crypto_service import encrypt_server_half


def create_secret(db: Session, name: str, owner_id, expires_in_days: int = 30) -> dict:
    key_data = generate_key_pair()

    encrypted_server_half = encrypt_server_half(db, key_data["server_half"])

    new_secret = Secret(
        name=name,
        owner_id=owner_id,
        server_half=encrypted_server_half,
        key_hash=key_data["key_hash"],
        status="active",
        expires_at=datetime.now(timezone.utc) + timedelta(days=expires_in_days),
    )

    db.add(new_secret)
    db.commit()
    db.refresh(new_secret)
    log_action(db, secret_id=new_secret.id, action="created")

    return {
        "id": str(new_secret.id),
        "name": new_secret.name,
        "client_half": key_data["client_half"],
        "expires_at": new_secret.expires_at,
    }