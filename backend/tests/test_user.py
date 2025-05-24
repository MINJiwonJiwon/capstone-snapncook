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
        "password_check": "Password123!",
        "nickname": "테스트유저"
    }

    # 회원가입
    signup_res = client.post("/api/auth/signup", json=user_data)
    assert signup_res.status_code in [200, 201]
    user_id = signup_res.json()["id"]

    # 로그인해서 토큰 발급
    login_res = client.post("/api/auth/login", json={
        "email": user_data["email"],
        "password": user_data["password"]
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    return user_id, user_data["email"], headers


def test_get_user_by_id(db_session: Session):
    user_id, user_email, headers = test_create_user(db_session)

    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200

    data = response.json()
    assert data["id"] == user_id
    assert data["email"] == user_email
    assert data["nickname"] == "테스트유저"


def test_refresh_token_revocation(db_session: Session):
    # 회원가입 및 로그인
    user_data = {
        "email": f"testuser{uuid4().hex[:8]}@example.com",
        "password": "Password123!",
        "password_check": "Password123!",
        "nickname": "토큰테스트"
    }

    # 1. 회원가입
    signup_res = client.post("/api/auth/signup", json=user_data)
    assert signup_res.status_code in [200, 201]

    # 2. 로그인 → 토큰 확보
    login_res = client.post("/api/auth/login", json={
        "email": user_data["email"],
        "password": user_data["password"]
    })
    assert login_res.status_code == 200
    tokens = login_res.json()
    refresh_token = tokens["refresh_token"]
    assert refresh_token is not None

    # 3. refresh 요청 (정상 작동)
    refresh_res_1 = client.post("/api/auth/refresh", json={
        "refresh_token": refresh_token
    })
    assert refresh_res_1.status_code == 200
    assert "access_token" in refresh_res_1.json()

    # 4. logout 요청 → revoke
    logout_res = client.post("/api/auth/logout", json={
        "refresh_token": refresh_token
    })
    assert logout_res.status_code == 200
    assert logout_res.json()["message"] == "Logged out successfully"

    # 5. revoke된 토큰으로 refresh 요청 → 실패 예상
    refresh_res_2 = client.post("/api/auth/refresh", json={
        "refresh_token": refresh_token
    })
    assert refresh_res_2.status_code == 401

def test_change_password_success(db_session: Session):
    # 1. 회원가입
    user_data = {
        "email": f"user{uuid4().hex[:8]}@test.com",
        "password": "Oldpass123!",
        "password_check": "Oldpass123!",
        "nickname": "비번유저"
    }
    signup_res = client.post("/api/auth/signup", json=user_data)
    assert signup_res.status_code == 200

    # 2. 로그인
    login_res = client.post("/api/auth/login", json={
        "email": user_data["email"],
        "password": user_data["password"]
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. 비밀번호 변경 요청
    password_payload = {
        "current_password": "Oldpass123!",
        "new_password": "Newpass123!",
        "new_password_check": "Newpass123!"
    }
    res = client.patch("/api/users/me/password", json=password_payload, headers=headers)
    assert res.status_code == 200
    assert res.json()["message"] == "비밀번호가 성공적으로 변경되었습니다."
