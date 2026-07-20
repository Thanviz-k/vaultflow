from datetime import datetime, timedelta, timezone
from app.services.crypto_service import decrypt_secret
from sqlalchemy.orm import Session

from app.models.owner import Owner
from app.models.secret import Secret

from app.services.audit_service import log_action
from app.services.key_service import (
    derive_client_half,
    derive_user_root_key,
    verify_vault_key,
)
from app.core.logger import logger

from app.services.crypto_service import (
    encrypt_secret,
)
from app.core.exceptions import (
    AuthenticationError,
    ResourceNotFoundError,
    VaultError,
)


def create_secret(
    db: Session,
    name: str,
    value: str,
    owner_id,
    vault_key: str,
    expires_in_days: int | None = 30,
) -> Secret:

    owner = db.query(Owner).filter(Owner.id == owner_id).first()

    if not owner:
        raise ResourceNotFoundError("Owner not found")

    if not owner.vault_initialized:
        raise VaultError("Vault has not been initialized")

    client_half = derive_client_half(
        vault_key,
        owner.vault_salt,
    )

    if not verify_vault_key(
        owner.server_half,
        client_half,
        owner.key_hash,
    ):
        logger.warning(
            "Invalid Vault Key for owner %s",
            owner.email,
        )

        raise AuthenticationError("Invalid Vault Key")

    root_key = derive_user_root_key(
        owner.server_half,
        client_half,
    )

    encrypted = encrypt_secret(
        root_key,
        value,
    )

    expires_at = (
        None
        if expires_in_days is None
        else datetime.now(timezone.utc) + timedelta(days=expires_in_days)
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

    logger.info(
        "Secret '%s' created by owner %s",
        name,
        owner.email,
    )

    return new_secret


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
        raise ResourceNotFoundError("Secret not found")

    if secret.status == "active":

        secret.status = "revoked"

        log_action(
            db,
            secret_id=secret.id,
            action="revoked",
        )

        db.commit()
        db.refresh(secret)

    logger.info(
        "Secret revoked by owner %s",
        owner_id,
    )
    return secret


def delete_secret(
    db: Session,
    secret_id,
    owner_id,
) -> bool:

    secret = (
        db.query(Secret)
        .filter(
            Secret.id == secret_id,
            Secret.owner_id == owner_id,
        )
        .first()
    )

    if not secret:
        raise ResourceNotFoundError("Secret not found")

    log_action(
        db,
        secret_id=secret.id,
        action="deleted",
    )

    db.delete(secret)
    db.commit()

    logger.info(
        "Secret deleted by owner %s",
        owner_id,
    )

    return True


def reveal_secret(
    db: Session,
    secret_id,
    owner_id,
    vault_key: str,
) -> dict:

    owner = db.query(Owner).filter(Owner.id == owner_id).first()

    if not owner:
        raise ResourceNotFoundError("Owner not found")

    if not owner.vault_initialized:
        raise VaultError("Vault has not been initialized")

    secret = (
        db.query(Secret)
        .filter(
            Secret.id == secret_id,
            Secret.owner_id == owner_id,
        )
        .first()
    )

    if not secret:
        raise ResourceNotFoundError("Secret not found")

    if secret.status != "active":
        raise AuthenticationError(f"Cannot reveal a {secret.status} secret")

    client_half = derive_client_half(
        vault_key,
        owner.vault_salt,
    )

    if not verify_vault_key(
        owner.server_half,
        client_half,
        owner.key_hash,
    ):
        log_action(
            db,
            secret_id=secret.id,
            action="reveal_failed",
            metadata={
                "reason": "invalid_vault_key",
            },
        )

        db.commit()

        logger.warning(
            "Invalid Vault Key for owner %s",
            owner.email,
        )

        raise AuthenticationError("Invalid Vault Key")

    root_key = derive_user_root_key(
        owner.server_half,
        client_half,
    )

    value = decrypt_secret(
        root_key,
        secret.encrypted_value,
        secret.nonce,
    )

    secret.last_accessed_at = datetime.now(timezone.utc)

    log_action(
        db,
        secret_id=secret.id,
        action="revealed",
    )

    db.commit()
    db.refresh(secret)

    logger.info(
        "Secret '%s' revealed by owner %s",
        secret.name,
        owner.email,
    )

    return {
        "id": secret.id,
        "name": secret.name,
        "value": value,
    }
