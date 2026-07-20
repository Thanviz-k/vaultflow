from sqlalchemy.orm import Session

from app.models.owner import Owner

from app.services.auth_service import hash_password


from app.services.key_service import (
    generate_vault_key,
    generate_vault_salt,
    initialize_vault,
)


def create_owner(
    db: Session,
    name: str,
    email: str,
    password: str,
    mode: str,
    vault_key: str | None = None,
) -> tuple[Owner, str | None]:
    """
    Create a new owner.

    mode:
        "generated" -> generate a Vault Key
        "custom"    -> use the user's Vault Key

    Returns:
        (owner, generated_vault_key)

    generated_vault_key is only returned when mode == "generated".
    """

    # Generate a unique salt for this owner
    vault_salt = generate_vault_salt()

    generated_vault_key = None

    if mode == "generated":
        generated_vault_key = generate_vault_key()
        final_vault_key = generated_vault_key

    elif mode == "custom":
        if not vault_key:
            raise ValueError("Vault Key is required for custom mode.")

        final_vault_key = vault_key

    else:
        raise ValueError("Invalid Vault Key mode.")

    key_data = initialize_vault(
        final_vault_key,
        vault_salt,
    )

    new_owner = Owner(
        name=name,
        email=email,
        password_hash=hash_password(password),
        vault_salt=vault_salt,
        server_half=key_data["server_half"],
        key_hash=key_data["key_hash"],
    )

    db.add(new_owner)
    db.commit()
    db.refresh(new_owner)

    return (
        new_owner,
        generated_vault_key,
    )
