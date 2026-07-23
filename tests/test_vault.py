import uuid


def test_initialize_vault(client):
    email = f"{uuid.uuid4()}@example.com"

    # Register
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
    headers = {"Authorization": f"Bearer {token}"}

    # Initialize Vault
    response = client.post(
        "/vault/initialize",
        headers=headers,
        json={
            "mode": "generated",
        },
    )

    assert response.status_code == 200

    body = response.json()

    assert body["message"] == "Vault initialized successfully."
    assert body["generated_key"] is not None