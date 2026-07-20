def test_login(client):
    client.post(
        "/owners/register",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "Password@123",
            "mode": "generated",
        },
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "Password@123",
        },
    )

    assert response.status_code == 200

    body = response.json()

    assert "access_token" in body
    assert body["token_type"] == "bearer"
