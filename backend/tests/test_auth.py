def test_registration_always_creates_student_and_password_is_hashed(client):
    response = client.post("/api/v1/auth/register", json={"email": "student@example.com", "full_name": "A Student", "password": "correct-horse-battery"})
    assert response.status_code == 201
    data = response.json()
    assert data["role"] == "student"
    assert "password_hash" not in data


def test_registration_does_not_accept_privileged_role(client):
    response = client.post("/api/v1/auth/register", json={"email": "teacher@example.com", "full_name": "A Teacher", "password": "correct-horse-battery", "role": "administrator"})
    assert response.status_code == 201
    assert response.json()["role"] == "student"


def test_login_and_invalid_credentials(client):
    client.post("/api/v1/auth/register", json={"email": "student@example.com", "full_name": "A Student", "password": "correct-horse-battery"})
    assert client.post("/api/v1/auth/login", json={"email": "student@example.com", "password": "correct-horse-battery"}).status_code == 200
    assert client.post("/api/v1/auth/login", json={"email": "student@example.com", "password": "wrong-password"}).status_code == 401
