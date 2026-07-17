import hashlib
import hmac
import secrets
import string

from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

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
        group = "".join(
            secrets.choice(ALPHABET)
            for _ in range(4)
        )
        groups.append(group)

    return "VF-" + "-".join(groups)


def derive_key_pair_from_vault_key(
    vault_key: str,
    salt: bytes,
) -> dict:
    """
    Derive the client half from the Vault Key and
    generate a random server half.
    """

    server_half = secrets.token_bytes(HALF_LENGTH)

    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=HALF_LENGTH,
        salt=salt,
        iterations=PBKDF2_ITERATIONS,
    )

    client_half = kdf.derive(
        vault_key.encode("utf-8")
    )

    full_key = server_half + client_half

    key_hash = hashlib.sha256(full_key).hexdigest()

    return {
        "full_key": full_key,
        "server_half": server_half,
        "client_half": client_half.hex(),
        "key_hash": key_hash,
    }

def derive_client_half(
    vault_key: str,
    salt: bytes,
) -> str:
    """
    Derive only the client half from an existing Vault Key.
    Used when encrypting/decrypting secrets.
    """

    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=HALF_LENGTH,
        salt=salt,
        iterations=PBKDF2_ITERATIONS,
    )

    client_half = kdf.derive(
        vault_key.encode("utf-8")
    )

    return client_half.hex()

def reconstruct_full_key(
    server_half: bytes,
    client_half_hex: str,
) -> bytes:
    """
    Reconstruct the original encryption key.
    """

    return (
        server_half +
        bytes.fromhex(client_half_hex)
    )


def verify_vault_key(
    server_half: bytes,
    client_half_hex: str,
    stored_hash: str,
) -> bool:
    """
    Verify that the supplied Vault Key is correct.
    """

    try:
        client_half = bytes.fromhex(client_half_hex)
    except ValueError:
        return False

    full_key = server_half + client_half

    computed_hash = hashlib.sha256(
        full_key
    ).hexdigest()

    return hmac.compare_digest(
        computed_hash,
        stored_hash,
    )