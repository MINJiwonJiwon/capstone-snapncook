# backend/tests/test_user.py

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

def test_create_user(db_session: Session):
    user_data = {
        "email": "testuser@example.com",
        "password": "Password123!",  # 특수문자와 숫자가 포함된 비밀번호
        "nickname": "테스트유저"
    }
    response = client.post("/auth/signup", json=user_data)
    assert response.status_code in [200, 201], f"Expected 200 or 201, got {response.status_code}"
    assert response.json()["email"] == user_data["email"], "Email doesn't match"
    assert response.json()["nickname"] == user_data["nickname"], "Nickname doesn't match"
    
    return response.json()["id"]

def test_get_user_by_id(db_session: Session):
    user_id = test_create_user(db_session)
    response = client.get(f"/users/{user_id}")
    
    assert response.status_code == 200
    assert response.json()["id"] == user_id
    assert response.json()["email"] == "testuser@example.com"
    assert response.json()["nickname"] == "테스트유저"
