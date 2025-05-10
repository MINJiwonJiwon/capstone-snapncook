# backend/tests/test_signup.py

from uuid import uuid4
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

def test_signup_user():
    user_data = {
        "email": f"testuser{uuid4()}@example.com",
        "password": "Password123!", 
        "password_check": "Password123!", 
        "nickname": "테스트유저"
    }
    response = client.post("/api/auth/signup", json=user_data)
    assert response.status_code in [200, 201], f"Expected 200 or 201, got {response.status_code}"
    assert response.json()["email"] == user_data["email"], "Email doesn't match"
    assert response.json()["nickname"] == user_data["nickname"], "Nickname doesn't match"

def test_signup_duplicate_user():
    user_data = {
    "email": f"duplicateuser{uuid4()}@example.com", 
    "password": "password123!",
    "nickname": "중복유저"
    }
    # 첫 번째 회원가입
    res1 = client.post("/api/auth/signup", json=user_data)
    assert res1.status_code in [200, 201], f"First signup failed: {res1.status_code}"
    
    # 두 번째 회원가입 시도 (중복 이메일)
    response = client.post("/api/auth/signup", json=user_data)
    assert response.status_code == 400, "Expected 400 for duplicate email"
