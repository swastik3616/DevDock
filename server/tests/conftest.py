"""
conftest.py — shared pytest fixtures for AquaDesk backend tests.

Strategy: Create the Flask app with MONGO_CONNECT=False so PyMongo
initialises lazily without connecting. Then immediately swap app.mongo
with a MagicMock whose .db is a real mongomock MongoClient database.
All requests handled by the test client run within the yield context,
so current_app.mongo resolves to our mock — no real MongoDB needed.
"""
import pytest
import mongomock
from unittest.mock import MagicMock


def _make_mock_mongo():
    """Return a MagicMock that wraps a mongomock database as .db."""
    client = mongomock.MongoClient()
    db = client["testdb"]
    mock_mongo = MagicMock()
    mock_mongo.db = db
    return mock_mongo


@pytest.fixture()
def app():
    """Flask app with PyMongo replaced by an in-memory mongomock database."""
    from app import create_app
    application = create_app({
        "TESTING": True,
        "MONGO_URI": "mongodb://localhost/testdb",
    })
    # Replace the real PyMongo instance so blueprints (current_app.mongo.db)
    # use the in-memory mongomock database instead of connecting to MongoDB.
    application.mongo = _make_mock_mongo()
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
