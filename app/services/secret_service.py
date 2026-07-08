from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.secret import Secret
from app.services.key_service import generate_key_pair
from app.services.audit_service import log_action
from app.services.crypto_service import (
    encrypt_server_half,
    encrypt_secret_value,
)


def create_secret(
    db: Session,
    name: str,
    value: str,
    owner_id,
    expires_in_days: int | None = 30,
) -> dict:

    # Generate split-key material
    key_data = generate_key_pair()

    # Encrypt server half
    encrypted_server_half = encrypt_server_half(
        db,
        key_data["server_half"],
    )

    # Encrypt the actual secret value
    encrypted_value = encrypt_secret_value(
        db,
        value,
    )

    # Calculate expiry
    if expires_in_days is None:
        expires_at = None

    else:
        expires_at = (
            datetime.now(timezone.utc)
            + timedelta(
                days=expires_in_days
            )
        )

    # Create secret database record
    new_secret = Secret(
        name=name,
        owner_id=owner_id,
        encrypted_value=encrypted_value,
        server_half=encrypted_server_half,
        key_hash=key_data["key_hash"],
        status="active",
        expires_at=expires_at,
    )

    db.add(new_secret)

    # Get UUID before commit
    db.flush()

    # Add audit record to same transaction
    log_action(
        db,
        secret_id=new_secret.id,
        action="created",
    )

    # Save secret and audit log together
    db.commit()

    db.refresh(new_secret)

    return {
        "id": str(new_secret.id),
        "name": new_secret.name,
        "client_half": key_data[
            "client_half"
        ],
        "expires_at": new_secret.expires_at,
    }


def revoke_secret(
    db: Session,
    secret_id,
    owner_id,
) -> Secret | None:

    secret = (
        db.query(Secret)
        .filter(
            Secret.id == secret_id,
            Secret.owner_id == owner_id,
        )
        .first()
    )

    if not secret:
        return None

    if secret.status == "active":

        secret.status = "revoked"

        log_action(
            db,
            secret_id=secret.id,
            action="revoked",
        )

        db.commit()

        db.refresh(secret)

    return secret