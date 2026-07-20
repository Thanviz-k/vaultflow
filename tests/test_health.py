def test_health(client):
    response = client.get("/health")

    print(response.status_code)
    print(response.text)

    assert response.status_code == 200
