# backend/tests/test_oauth.py

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.db import get_db
from sqlalchemy.orm import Session

client = TestClient(app)

@pytest.fixture(scope="function")
def db_session():
    db: Session = next(get_db())
    db.begin()
    yield db
    db.rollback()

def test_oauth_login_google(db_session: Session):
    response = client.get("/oauth/google/login")
    assert response.status_code == 200

def test_oauth_login_kakao(db_session: Session):
    response = client.get("/oauth/kakao/login")
    assert response.status_code == 200

def test_oauth_login_naver(db_session: Session):
    response = client.get("/oauth/naver/login")
    assert response.status_code == 200
