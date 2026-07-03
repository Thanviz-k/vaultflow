import secrets
import hashlib
import hmac

KEY_LENGTH_BYTES = 32

def generate_key_pair() -> dict:
    full_key = secrets.token_bytes(KEY_LENGTH_BYTES)

    half_point = len(full_key) // 2
    server_half = full_key[:half_point]
    client_half = full_key[half_point:]

    key_hash = hashlib.sha256(full_key).hexdigest()

    return {
        "server_half": server_half.hex(),
        "client_half": client_half.hex(),
        "key_hash": key_hash,
    }


def verify_key(server_half_hex: str, client_half_hex: str, stored_hash: str) -> bool:
    server_half = bytes.fromhex(server_half_hex)
    client_half = bytes.fromhex(client_half_hex)

    reconstructed_key = server_half + client_half
    computed_hash = hashlib.sha256(reconstructed_key).hexdigest()

    return hmac.compare_digest(computed_hash, stored_hash)