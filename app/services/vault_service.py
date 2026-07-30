from sqlalchemy.orm import Session
from app.core.exceptions import VaultError, AuthenticationError
from app.models.owner import Owner
from app.services.key_service import (
    generate_vault_salt,
    initialize_vault,
    derive_client_half,
    derive_user_root_key,
    verify_vault_key,
)
from app.services.crypto_service import decrypt_secret, encrypt_secret
from app.services.audit_service import log_action
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


def rotate_owner_vault_key(
    db: Session,
    owner: Owner,
    current_vault_key: str,
    new_vault_key: str,
) -> Owner:
    """
    Change the owner's Vault Key WITHOUT deleting any secrets.

    Unlike reset_owner_vault, this re-encrypts every secret under the
    new key instead of destroying them. All-or-nothing: every secret is
    decrypted and re-encrypted in memory first; the database is only
    touched once every single secret has succeeded. If anything fails
    partway through, no row is written and the vault is left exactly
    as it was.
    """

    if not owner.vault_initialized:
        raise VaultError("Vault has not been initialized")

    # 1. Prove the caller actually knows the CURRENT key before we do
    #    anything else — same guard as reset.
    old_client_half = derive_client_half(
        current_vault_key,
        owner.vault_salt,
    )

    if not verify_vault_key(
        owner.server_half,
        old_client_half,
        owner.key_hash,
    ):
        raise AuthenticationError("Current Vault Key is incorrect")

    old_root_key = derive_user_root_key(
        owner.server_half,
        old_client_half,
    )

    # 2. Load every secret that actually has an encrypted value.
    #    (Revoked secrets with encrypted_value cleared, e.g. by
    #    delete_secret, are skipped — there's nothing to re-encrypt.)
    secrets_to_rotate = (
        db.query(Secret)
        .filter(
            Secret.owner_id == owner.id,
            Secret.encrypted_value.isnot(None),
        )
        .all()
    )

    # 3. Decrypt everything with the OLD key first. Nothing is written
    #    to the database in this step — if any secret fails to decrypt
    #    (corruption, tampering, etc.), we bail out here and the vault
    #    is untouched.
    decrypted_values = {}
    for secret in secrets_to_rotate:
        try:
            decrypted_values[secret.id] = decrypt_secret(
                old_root_key,
                secret.encrypted_value,
                secret.nonce,
            )
        except Exception as exc:
            raise VaultError(
                f"Rotation aborted: could not decrypt secret "
                f"'{secret.name}' with the current key. "
                f"No changes were made."
            ) from exc

    # 4. Derive brand-new key material for the new Vault Key — same
    #    process as initial vault setup (fresh salt + fresh server half).
    new_salt = generate_vault_salt()
    new_vault_data = initialize_vault(
        vault_key=new_vault_key,
        salt=new_salt,
    )
    new_client_half = derive_client_half(
        new_vault_key,
        new_salt,
    )
    new_root_key = derive_user_root_key(
        new_vault_data["server_half"],
        new_client_half,
    )

    # 5. Re-encrypt every secret with the NEW key, still only in memory.
    re_encrypted = {}
    for secret in secrets_to_rotate:
        try:
            re_encrypted[secret.id] = encrypt_secret(
                new_root_key,
                decrypted_values[secret.id],
            )
        except Exception as exc:
            raise VaultError(
                f"Rotation aborted: could not re-encrypt secret "
                f"'{secret.name}' with the new key. "
                f"No changes were made."
            ) from exc

    # 6. Only now do we touch the database — everything above was
    #    computed in memory, so this block cannot fail for
    #    cryptographic reasons, only for DB-level ones.
    try:
        for secret in secrets_to_rotate:
            encrypted = re_encrypted[secret.id]
            secret.encrypted_value = encrypted["ciphertext"]
            secret.nonce = encrypted["nonce"]

        owner.vault_salt = new_salt
        owner.server_half = new_vault_data["server_half"]
        owner.key_hash = new_vault_data["key_hash"]

        for secret in secrets_to_rotate:
            log_action(
                db,
                secret_id=secret.id,
                secret_name=secret.name,
                action="vault_key_rotated",
            )

        db.commit()
        db.refresh(owner)
    except Exception:
        db.rollback()
        raise VaultError(
            "Rotation aborted while saving changes. No changes were made."
        )

    logger.info(
        "Vault Key rotated for owner %s (%d secrets re-encrypted)",
        owner.email,
        len(secrets_to_rotate),
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