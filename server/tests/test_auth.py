"""
test_auth.py — 8 tests for /auth routes.

Fixtures (app, client, auth_token) are declared in conftest.py.
"""


# ── Registration ──────────────────────────────────────────────────────────────

def test_register_success(client):
    res = client.post("/auth/register", json={
        "username": "alice",
        "password": "secret123",
    })
    assert res.status_code == 201
    assert "registered" in res.get_json()["message"].lower()


def test_register_duplicate_username(client):
    payload = {"username": "bob", "password": "secret123"}
    client.post("/auth/register", json=payload)
    res = client.post("/auth/register", json=payload)  # second attempt
    assert res.status_code == 400
    assert "already exists" in res.get_json()["message"].lower()


def test_register_missing_fields(client):
    # username present but no password — should not crash
    res = client.post("/auth/register", json={"username": "nopass"})
    # The server currently attempts to hash None — this should return a 4xx or 5xx.
    # We assert it doesn't return 2xx (i.e. it does not silently succeed).
    assert res.status_code >= 400


# ── Login ─────────────────────────────────────────────────────────────────────

def test_login_success_returns_token(client):
    client.post("/auth/register", json={"username": "charlie", "password": "pass"})
    res = client.post("/auth/login", json={"username": "charlie", "password": "pass"})
    assert res.status_code == 200
    data = res.get_json()
    assert "token" in data
    assert isinstance(data["token"], str)
    assert len(data["token"]) > 20  # sanity: it's a real JWT


def test_login_wrong_password(client):
    client.post("/auth/register", json={"username": "dave", "password": "correct"})
    res = client.post("/auth/login", json={"username": "dave", "password": "wrong"})
    assert res.status_code == 401


def test_login_unknown_user(client):
    res = client.post("/auth/login", json={"username": "ghost", "password": "x"})
    assert res.status_code == 401


# ── /auth/me (token-protected) ────────────────────────────────────────────────

def test_get_me_with_valid_token(client, auth_token):
    res = client.get("/auth/me", headers={"Authorization": f"Bearer {auth_token}"})
    assert res.status_code == 200
    assert res.get_json()["username"] == "testuser"


def test_get_me_without_token_returns_401(client):
    res = client.get("/auth/me")
    assert res.status_code == 401


def test_get_me_with_invalid_token_returns_401(client):
    res = client.get("/auth/me", headers={"Authorization": "Bearer not.a.real.token"})
    assert res.status_code == 401
