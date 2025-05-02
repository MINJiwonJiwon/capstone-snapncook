# backend/tests/test_user.py

import pytest
from uuid import uuid4
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
        "email": f"testuser{uuid4().hex[:8]}@example.com",
        "password": "Password123!",
        "nickname": "테스트유저"
    }

    # 회원가입
    signup_res = client.post("/auth/signup", json=user_data)
    assert signup_res.status_code in [200, 201]
    user_id = signup_res.json()["id"]

    # 로그인해서 토큰 발급
    login_res = client.post("/auth/login", json={
        "email": user_data["email"],
        "password": user_data["password"]
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    return user_id, user_data["email"], headers


def test_get_user_by_id(db_session: Session):
    user_id, user_email, headers = test_create_user(db_session)

    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200

    data = response.json()
    assert data["id"] == user_id
    assert data["email"] == user_email
    assert data["nickname"] == "테스트유저"
