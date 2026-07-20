import pytest
from fastapi.testclient import TestClient

from app.main import app

import uuid


@pytest.fixture
def registered_owner(client):
    email = f"{uuid.uuid4()}@example.com"

    response = client.post(
        "/owners/register",
        json={
            "name": "Test User",
            "email": email,
            "password": "Password@123",
            "mode": "generated",
        },
    )

    assert response.status_code == 200

    data = response.json()

    return {
        "email": email,
        "password": "Password@123",
        "vault_key": data["generated_vault_key"],
    }


@pytest.fixture
def auth_headers(client, registered_owner):
    response = client.post(
        "/auth/login",
        json={
            "email": registered_owner["email"],
            "password": registered_owner["password"],
        },
    )

    assert response.status_code == 200

    token = response.json()["access_token"]

    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client
