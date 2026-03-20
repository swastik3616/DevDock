"""
test_files.py — 5 tests for /files CRUD routes.

Correction applied: description now matches 5 numbered tests (was incorrectly
labelled "4 tests" in the original plan).
"""


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


# ── GET /files ────────────────────────────────────────────────────────────────

def test_get_files_seeds_defaults_for_new_user(client, auth_token):
    """First GET for a new user should return 3 seeded default entries."""
    res = client.get("/files", headers=_auth(auth_token))
    assert res.status_code == 200
    files = res.get_json()
    assert len(files) == 3
    names = {f["name"] for f in files}
    assert "Documents" in names


# ── POST /files ───────────────────────────────────────────────────────────────

def test_upload_file_returns_201(client, auth_token):
    res = client.post(
        "/files",
        json={"name": "report.pdf", "type": "file", "size": "42 KB"},
        headers=_auth(auth_token)
    )
    assert res.status_code == 201
    data = res.get_json()
    assert data["name"] == "report.pdf"
    assert "id" in data
    assert "user" not in data  # user field stripped


# ── DELETE /files/<id> ────────────────────────────────────────────────────────

def test_delete_file_returns_200(client, auth_token):
    created = client.post(
        "/files", json={"name": "temp.txt", "type": "file", "size": "1 B"},
        headers=_auth(auth_token)
    ).get_json()
    res = client.delete(f"/files/{created['id']}", headers=_auth(auth_token))
    assert res.status_code == 200
    assert "deleted" in res.get_json()["message"].lower()


# ── PATCH /files/<id> (rename) ────────────────────────────────────────────────

def test_rename_file_returns_200(client, auth_token):
    created = client.post(
        "/files", json={"name": "old.txt", "type": "file", "size": "10 B"},
        headers=_auth(auth_token)
    ).get_json()
    res = client.patch(
        f"/files/{created['id']}",
        json={"name": "new.txt"},
        headers=_auth(auth_token)
    )
    assert res.status_code == 200
    assert "renamed" in res.get_json()["message"].lower()


def test_rename_nonexistent_file_returns_404(client, auth_token):
    res = client.patch(
        "/files/does-not-exist",
        json={"name": "anything.txt"},
        headers=_auth(auth_token)
    )
    assert res.status_code == 404
