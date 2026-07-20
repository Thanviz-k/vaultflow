import hashlib
import hmac
import secrets

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

KEY_LENGTH_BYTES = 32
HALF_LENGTH = KEY_LENGTH_BYTES // 2

PBKDF2_ITERATIONS = 200_000

ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def generate_vault_salt() -> bytes:
    """
    Generate a unique random salt for each user.
    """
    return secrets.token_bytes(32)


def generate_vault_key() -> str:
    """
    Generate a user-friendly Vault Key.

    Example:
        VF-8KX2-PQ9M-L7TR-Y5WD
    """

    groups = []

    for _ in range(4):
        group = "".join(secrets.choice(ALPHABET) for _ in range(4))
        groups.append(group)

    return "VF-" + "-".join(groups)


def derive_user_root_key(
    server_half: bytes,
    client_half: bytes,
) -> bytes:
    """
    Derive the user's root encryption key using HKDF.
    """

    hkdf = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=server_half,
        info=b"vaultflow-root-key",
    )

    return hkdf.derive(client_half)


def initialize_vault(
    vault_key: str,
    salt: bytes,
) -> dict:
    """
    Initialize a user's vault.

    - Generate Server Half
    - Derive Client Half
    - Derive Root Key
    - Store verification hash
    """

    server_half = secrets.token_bytes(HALF_LENGTH)

    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=HALF_LENGTH,
        salt=salt,
        iterations=PBKDF2_ITERATIONS,
    )

    client_half = kdf.derive(vault_key.encode("utf-8"))

    root_key = derive_user_root_key(
        server_half,
        client_half,
    )

    key_hash = hashlib.sha256(root_key).hexdigest()

    return {
        "server_half": server_half,
        "key_hash": key_hash,
    }


def derive_client_half(
    vault_key: str,
    salt: bytes,
) -> bytes:
    """
    Derive the client half from an existing Vault Key.
    Used during encryption and decryption.
    """

    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=HALF_LENGTH,
        salt=salt,
        iterations=PBKDF2_ITERATIONS,
    )

    client_half = kdf.derive(vault_key.encode("utf-8"))

    return client_half


def verify_vault_key(
    server_half: bytes,
    client_half: bytes,
    stored_hash: str,
) -> bool:
    """
    Verify that the supplied Vault Key is correct.
    """

    root_key = derive_user_root_key(
        server_half,
        client_half,
    )

    computed_hash = hashlib.sha256(root_key).hexdigest()

    return hmac.compare_digest(
        computed_hash,
        stored_hash,
    )
