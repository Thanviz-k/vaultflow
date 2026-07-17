import hashlib
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes


server_half_key = os.getenv("SERVER_HALF_KEY")

if not server_half_key:
    raise RuntimeError(
        "SERVER_HALF_KEY environment variable is not set"
    )

SERVER_HALF_KEY = hashlib.sha256(
    server_half_key.encode()
).digest()


def derive_aes_key(full_key: bytes) -> bytes:
    hkdf = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=None,
        info=b"vaultflow-secret-encryption",
    )

    return hkdf.derive(full_key)


def encrypt_secret(
    full_key: bytes,
    plaintext: str,
) -> dict:
    aes_key = derive_aes_key(full_key)

    aes = AESGCM(aes_key)

    nonce = os.urandom(12)

    ciphertext = aes.encrypt(
        nonce,
        plaintext.encode(),
        None,
    )

    return {
        "ciphertext": ciphertext,
        "nonce": nonce,
    }

def decrypt_secret(
    full_key: bytes,
    ciphertext: bytes,
    nonce: bytes,
) -> str:
    aes_key = derive_aes_key(full_key)

    aes = AESGCM(aes_key)

    plaintext = aes.decrypt(
        nonce,
        ciphertext,
        None,
    )

    return plaintext.decode()


def encrypt_server_half(
    server_half: bytes,
) -> bytes:
    aes = AESGCM(SERVER_HALF_KEY)

    nonce = os.urandom(12)

    encrypted = aes.encrypt(
        nonce,
        server_half,
        None,
    )

    return nonce + encrypted


def decrypt_server_half(
    encrypted_server_half: bytes,
) -> bytes:
    nonce = encrypted_server_half[:12]

    ciphertext = encrypted_server_half[12:]

    aes = AESGCM(SERVER_HALF_KEY)

    return aes.decrypt(
        nonce,
        ciphertext,
        None,
    )