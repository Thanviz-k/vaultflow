from datetime import datetime, timedelta, timezone
from app.services.crypto_service import decrypt_secret
from sqlalchemy.orm import Session

from app.models.owner import Owner
from app.models.secret import Secret
from sqlalchemy import or_

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
def verify_owner_vault_key(
    db: Session,
    owner_id,
    vault_key: str,
) -> Owner:

    owner = (
        db.query(Owner)
        .filter(Owner.id == owner_id)
        .first()
    )

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
        raise AuthenticationError("Invalid Vault Key")

    return owner

def create_secret(
    db: Session,
    name: str,
    value: str,
    owner_id,
    vault_key: str,
    expires_in_days: int | None = 30,
) -> Secret:

    owner = verify_owner_vault_key(
    db,
    owner_id,
    vault_key,
)

    client_half = derive_client_half(
        vault_key,
        owner.vault_salt,
    )

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
        secret_name=new_secret.name,
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

def update_secret(
    db: Session,
    secret_id,
    owner_id,
    name: str,
    value: str,
    vault_key: str,
) -> Secret:

    owner = verify_owner_vault_key(
    db,
    owner_id,
    vault_key,
)

    client_half = derive_client_half(
        vault_key,
        owner.vault_salt,
    )

    root_key = derive_user_root_key(
        owner.server_half,
        client_half,
    )

    encrypted = encrypt_secret(
            root_key,
            value,
        )
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
    
    old_name = secret.name

    secret.name = name
    secret.encrypted_value = encrypted["ciphertext"]
    secret.nonce = encrypted["nonce"]

    log_action(
                db,
                secret_id=secret.id,
                secret_name=secret.name,
                action="updated",
                metadata={
                    "old_name": old_name,
                    "new_name": name,
                },
            )

    db.commit()
    db.refresh(secret)

    logger.info(
                "Secret '%s' updated by owner %s",
                name,
                owner.email,
            )

    return secret

def revoke_secret(
    db: Session,
    secret_id,
    owner_id,
    vault_key,
) -> Secret | None:

    verify_owner_vault_key(
        db,
        owner_id,
        vault_key,
    )

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

        # Permanently erase the encrypted secret
        secret.encrypted_value = None
        secret.nonce = None
        secret.revoked_at = datetime.now(timezone.utc)

        log_action(
            db,
            secret_id=secret.id,
            secret_name=secret.name,
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
    vault_key,
) -> bool:

    verify_owner_vault_key(
    db,
    owner_id,
    vault_key,
)

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
        secret_name=secret.name,
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

    owner = verify_owner_vault_key(
        db,
        owner_id,
        vault_key,
    )

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
        raise AuthenticationError(
            f"Cannot reveal a {secret.status} secret"
        )

    client_half = derive_client_half(
        vault_key,
        owner.vault_salt,
    )

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
        secret_name=secret.name,
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

def get_revoked_secrets(
    db: Session,
    owner_id,
):
    return (
        db.query(Secret)
        .filter(
            Secret.owner_id == owner_id,
            Secret.status == "revoked",
        )
        .order_by(Secret.revoked_at.desc())
        .all()
    )


def search_secrets(
    db: Session,
    owner_id,
    query: str,
):
    return (
        db.query(Secret)
        .filter(
            Secret.owner_id == owner_id,
            Secret.name.ilike(f"%{query}%"),
        )
        .all()
    )