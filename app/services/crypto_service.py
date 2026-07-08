import os

from sqlalchemy import text
from sqlalchemy.orm import Session


MASTER_KEY = os.getenv("MASTER_KEY")


def encrypt_server_half(
    db: Session,
    server_half_hex: str,
) -> bytes:
    result = db.execute(
        text(
            """
            SELECT pgp_sym_encrypt(
                :value,
                :key
            ) AS encrypted
            """
        ),
        {
            "value": server_half_hex,
            "key": MASTER_KEY,
        },
    )

    return result.scalar()


def decrypt_server_half(
    db: Session,
    encrypted_value: bytes,
) -> str:
    result = db.execute(
        text(
            """
            SELECT pgp_sym_decrypt(
                :value,
                :key
            ) AS decrypted
            """
        ),
        {
            "value": encrypted_value,
            "key": MASTER_KEY,
        },
    )

    return result.scalar()


def encrypt_secret_value(
    db: Session,
    secret_value: str,
) -> bytes:
    result = db.execute(
        text(
            """
            SELECT pgp_sym_encrypt(
                :value,
                :key
            ) AS encrypted
            """
        ),
        {
            "value": secret_value,
            "key": MASTER_KEY,
        },
    )

    return result.scalar()


def decrypt_secret_value(
    db: Session,
    encrypted_value: bytes,
) -> str:
    result = db.execute(
        text(
            """
            SELECT pgp_sym_decrypt(
                :value,
                :key
            ) AS decrypted
            """
        ),
        {
            "value": encrypted_value,
            "key": MASTER_KEY,
        },
    )

    return result.scalar()
