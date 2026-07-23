from sqlalchemy.orm import Session
from app.core.exceptions import VaultError
from app.models.owner import Owner
from app.services.key_service import (
    generate_vault_salt,
    initialize_vault,
)
from app.core.logger import logger
from app.models.secret import Secret

def initialize_owner_vault(
    db: Session,
    owner: Owner,
    vault_key: str,
) -> Owner:
    """
    Initialize a user's vault.

    This should only be called once after registration.
    """

    if owner.vault_initialized:
        raise VaultError("Vault is already initialized.")

    vault_salt = generate_vault_salt()

    vault_data = initialize_vault(
        vault_key=vault_key,
        salt=vault_salt,
    )

    owner.vault_salt = vault_salt
    owner.server_half = vault_data["server_half"]
    owner.key_hash = vault_data["key_hash"]
    owner.vault_initialized = True

    db.commit()
    db.refresh(owner)

    logger.info(
        "Vault initialized for owner %s",
        owner.email,
    )

    return owner



def reset_owner_vault(
    db: Session,
    owner: Owner,
) -> Owner:
    """
    Reset the owner's vault.

    Deletes all secrets and clears vault initialization.
    """

    db.query(Secret).filter(
        Secret.owner_id == owner.id
    ).delete()

    owner.vault_salt = None
    owner.server_half = None
    owner.key_hash = None
    owner.vault_initialized = False

    db.commit()
    db.refresh(owner)

    logger.info(
        "Vault reset for owner %s",
        owner.email,
    )

    return owner


def get_vault_status(
    db: Session,
    owner_id: int,
) -> bool:

    owner = (
        db.query(Owner)
        .filter(Owner.id == owner_id)
        .first()
    )

    if owner is None:
        raise ValueError("Owner not found")

    return owner.vault_initialized