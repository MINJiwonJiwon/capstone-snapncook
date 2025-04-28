# backend/tests/test_user.py

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.db import get_db
from uuid import uuid4
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
    response = client.post("/auth/signup", json=user_data)
    assert response.status_code in [200, 201], f"Expected 200 or 201, got {response.status_code}"
    assert response.json()["email"] == user_data["email"], "Email doesn't match"
    assert response.json()["nickname"] == user_data["nickname"], "Nickname doesn't match"
    
    return response.json()["id"], user_data["email"]

def test_get_user_by_id(db_session: Session):
    # 유저 생성 후, 생성된 user_id를 받아옴
    user_id, _ = test_create_user(db_session)

    # 유저 정보 조회 요청
    response = client.get(f"/users/{user_id}")

    # HTTP 상태 코드 확인
    assert response.status_code == 200

    # 반환된 JSON 응답에서 email과 nickname을 확인
    user_email = response.json()["email"]
    user_nickname = response.json()["nickname"]

    # 이메일에서 UUID 부분을 확인하기 위한 로직
    expected_email = f"testuser{user_email.split('@')[0].split('testuser')[1]}@example.com"
    
    assert response.json()["id"] == user_id
    assert user_email == expected_email
    assert user_nickname == "테스트유저"
