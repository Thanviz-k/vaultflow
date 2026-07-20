import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def encrypt_secret(
    root_key: bytes,
    plaintext: str,
) -> dict:
    """
    Encrypt a secret using the user's derived root key.
    """

    aes = AESGCM(root_key)

    nonce = os.urandom(12)

    ciphertext = aes.encrypt(
        nonce,
        plaintext.encode("utf-8"),
        None,
    )

    return {
        "ciphertext": ciphertext,
        "nonce": nonce,
    }


def decrypt_secret(
    root_key: bytes,
    ciphertext: bytes,
    nonce: bytes,
) -> str:
    """
    Decrypt a secret using the user's derived root key.
    """

    aes = AESGCM(root_key)

    plaintext = aes.decrypt(
        nonce,
        ciphertext,
        None,
    )

    return plaintext.decode("utf-8")
