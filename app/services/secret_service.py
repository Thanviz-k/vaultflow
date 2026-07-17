from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.owner import Owner
from app.models.secret import Secret

from app.services.audit_service import log_action

from app.services.key_service import (
    derive_client_half,
    verify_vault_key,
    reconstruct_full_key,
)

from app.services.crypto_service import (
    decrypt_server_half,
    encrypt_secret,
)


def create_secret(
    db: Session,
    name: str,
    value: str,
    owner_id,
    vault_key: str,
    expires_in_days: int | None = 30,
) -> dict:

    owner = (
        db.query(Owner)
        .filter(Owner.id == owner_id)
        .first()
    )

    if not owner:
        raise ValueError("Owner not found")

    # Derive the client half from the Vault Key
    client_half = derive_client_half(
        vault_key,
        owner.vault_salt,
    )

    # Decrypt the owner's server half
    server_half = decrypt_server_half(
        owner.encrypted_server_half
    )

    # Verify Vault Key
    if not verify_vault_key(
        server_half,
        client_half,
        owner.key_hash,
    ):
        raise ValueError("Invalid Vault Key")

    # Reconstruct full encryption key
    full_key = reconstruct_full_key(
        server_half,
        client_half,
    )

    encrypted = encrypt_secret(
        full_key,
        value,
    )

    expires_at = (
        None
        if expires_in_days is None
        else datetime.now(timezone.utc)
        + timedelta(days=expires_in_days)
    )

    new_secret = Secret(
        name=name,
        owner_id=owner_id,
        encrypted_value=encrypted["ciphertext"],
        nonce=encrypted["nonce"],
        status="active",
        expires_at=expires_at,
    )

    db.add(new_secret)
    db.flush()

    log_action(
        db,
        secret_id=new_secret.id,
        action="created",
    )

    db.commit()
    db.refresh(new_secret)

    return {
        "id": new_secret.id,
        "name": new_secret.name,
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