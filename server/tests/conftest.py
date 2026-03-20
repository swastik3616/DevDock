"""
conftest.py — shared pytest fixtures for AquaDesk backend tests.

Uses mongomock.patch() to intercept all PyMongo connections so tests
run fully offline with no real MongoDB required.
"""
import pytest
import mongomock
from app import create_app


@pytest.fixture()
def app():
    """Flask app wired to an in-memory mongomock database."""
    with mongomock.patch(servers=(("localhost", 27017),)):
        application = create_app({
            "TESTING": True,
            "MONGO_URI": "mongodb://localhost/testdb",
        })
        yield application


@pytest.fixture()
def client(app):
    """Flask test client — keeps all HTTP calls in-process."""
    return app.test_client()


@pytest.fixture()
def auth_token(client):
    """
    Registers a fresh test user and returns a valid JWT.
    Uses the in-process test client — no real HTTP calls.
    """
    client.post("/auth/register", json={
        "username": "testuser",
        "password": "testpass123",
    })
    res = client.post("/auth/login", json={
        "username": "testuser",
        "password": "testpass123",
    })
    return res.get_json()["token"]
