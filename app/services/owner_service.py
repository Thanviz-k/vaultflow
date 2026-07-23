from sqlalchemy.orm import Session

from app.models.owner import Owner
from app.services.auth_service import hash_password
from app.services.vault_service import initialize_owner_vault


def initialize_vault(
    db: Session,
    owner: Owner,
    mode: str,
    vault_key: str | None,
):
    """
    Initialize a user's vault.

    This should only be called once after registration.
    """

    if owner.vault_initialized:
        raise ValueError("Vault is already initialized.")

    if mode == "generated":
        # Generate a random vault key
        import secrets
        import base64

        vault_key = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode()

    elif mode == "custom":
        if not vault_key:
            raise ValueError("Vault key must be provided for custom mode.")
        if len(vault_key) < 8:
            raise ValueError("Vault key must be at least 8 characters long.")

    else:
        raise ValueError("Invalid mode. Must be 'generated' or 'custom'.")

    # Initialize the vault with the provided or generated key

    owner = initialize_owner_vault(
        db=db,
        owner=owner,
        vault_key=vault_key,
    )

    return owner, vault_key
def create_owner(
    db: Session,
    name: str,
    email: str,
    password: str,
) -> Owner:

    new_owner = Owner(
        name=name,
        email=email,
        password_hash=hash_password(password),

        # Vault will be initialized later
        vault_initialized=False,
        vault_salt=None,
        server_half=None,
        key_hash=None,
    )

    db.add(new_owner)
    db.commit()
    db.refresh(new_owner)

    return new_owner

