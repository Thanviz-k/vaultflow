import uuid


def test_create_secret(client):
    email = f"{uuid.uuid4()}@example.com"

    # Register Owner
    register = client.post(
        "/owners/register",
        json={
            "name": "Test User",
            "email": email,
            "password": "Password@123",
            "mode": "generated",
        },
    )

    assert register.status_code == 201

    # Login
    login = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": "Password@123",
        },
    )

    assert login.status_code == 200

    token = login.json()["access_token"]

    headers = {
        "Authorization": f"Bearer {token}"
    }

    # Initialize Vault
    initialize = client.post(
        "/vault/initialize",
        headers=headers,
        json={
            "mode": "generated"
        },
    )

    print(initialize.status_code)
    print(initialize.text)

    assert initialize.status_code == 200

    # Get generated vault key
    vault_key = initialize.json()["generated_key"]

    assert vault_key is not None

    # Create Secret
    response = client.post(
        "/secrets/",
        headers=headers,
        json={
            "name": "GitHub",
            "value": "ghp_xxxxx",
            "vault_key": vault_key,
            "expires_in_days": 30,
        },
    )

    print(response.status_code)
    print(response.text)

    assert response.status_code == 201