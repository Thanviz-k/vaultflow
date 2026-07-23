import uuid


def test_register_owner(client):
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

    assert response.status_code == 201
