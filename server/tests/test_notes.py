"""
test_notes.py — 5 tests for /notes CRUD routes.

All requests are authenticated via the auth_token fixture from conftest.py.
"""


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


# ── GET /notes ────────────────────────────────────────────────────────────────

def test_get_notes_empty_for_new_user(client, auth_token):
    res = client.get("/notes", headers=_auth(auth_token))
    assert res.status_code == 200
    assert res.get_json() == []


# ── POST /notes ───────────────────────────────────────────────────────────────

def test_create_note_returns_201(client, auth_token):
    res = client.post("/notes", json={"title": "My Note", "content": "Hello!"}, headers=_auth(auth_token))
    assert res.status_code == 201
    data = res.get_json()
    assert data["title"] == "My Note"
    assert data["content"] == "Hello!"
    assert "id" in data
    assert "user" not in data  # user field must be stripped from response


# ── PUT /notes/<id> ───────────────────────────────────────────────────────────

def test_update_note_returns_updated_data(client, auth_token):
    # create
    created = client.post(
        "/notes", json={"title": "Old Title", "content": "Old Content"},
        headers=_auth(auth_token)
    ).get_json()
    note_id = created["id"]

    # update
    res = client.put(
        f"/notes/{note_id}",
        json={"title": "New Title"},
        headers=_auth(auth_token)
    )
    assert res.status_code == 200
    assert res.get_json()["title"] == "New Title"


# ── DELETE /notes/<id> ────────────────────────────────────────────────────────

def test_delete_note_returns_200(client, auth_token):
    created = client.post(
        "/notes", json={"title": "Temp", "content": ""},
        headers=_auth(auth_token)
    ).get_json()
    res = client.delete(f"/notes/{created['id']}", headers=_auth(auth_token))
    assert res.status_code == 200
    assert "deleted" in res.get_json()["message"].lower()


def test_delete_nonexistent_note_returns_404(client, auth_token):
    res = client.delete("/notes/does-not-exist", headers=_auth(auth_token))
    assert res.status_code == 404
