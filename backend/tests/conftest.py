# tests/conftest.py

import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from backend.main import app
from backend.db import get_db, SessionLocal
from backend import models
from backend.app.auth.utils import create_access_token, hash_password

client = TestClient(app)

# DB 세션 override (선택적으로 mocking 가능)
@pytest.fixture(scope="function")
def db_session():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 테스트용 유저 생성 fixture
@pytest.fixture
def test_user(db_session: Session):
    unique_email = f"testuser_{uuid.uuid4().hex[:6]}@example.com"

    user = models.User(
        email=unique_email,
        nickname="testuser",
        password_hash=hash_password("TestPassword123!"),
        is_admin=False,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

# 인증된 access_token 생성
@pytest.fixture
def access_token(test_user: models.User):
    return create_access_token(data={"sub": str(test_user.id)})

# 인증된 client
@pytest.fixture
def auth_client(access_token: str):
    client.headers.update({
        "Authorization": f"Bearer {access_token}"
    })
    return client

# 매번 새로운 유저 생성 + 로그인 → 인증 헤더 반환
@pytest.fixture
def authenticated_headers():
    """UUID 기반 유저 회원가입 & 로그인 후 인증 헤더 반환"""
    email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    password = "TestPassword123!"
    signup_data = {"email": email, "password": password, "nickname": "임시유저"}
    
    res = client.post("/auth/signup", json=signup_data)
    assert res.status_code in [200, 201]

    login_res = client.post("/auth/login", json={"email": email, "password": password})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    return {"Authorization": f"Bearer {token}"}
