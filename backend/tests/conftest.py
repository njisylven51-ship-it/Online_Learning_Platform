import os

os.environ.setdefault("DATABASE_URL", "sqlite:////tmp/learning-platform-tests.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key-that-is-long-enough")
os.environ.setdefault("APP_ENV", "test")

import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel

from app.core.database import engine
from app.main import app


@pytest.fixture(autouse=True)
def fresh_database(monkeypatch):
    monkeypatch.setattr("app.services.notification_service.send_email", lambda *args, **kwargs: False)
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
