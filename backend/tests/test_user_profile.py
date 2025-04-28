# backend/tests/test_user_profile.py

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.db import get_db
from backend.tests.test_user import test_create_user
from sqlalchemy.orm import Session

client = TestClient(app)

@pytest.fixture(scope="function")
def db_session():
    db: Session = next(get_db())
    db.begin()
    yield db
    db.rollback()

def get_access_token(db_session: Session):
    user_id, email = test_create_user(db_session)  # (user_id, email) 둘 다 받음
    login_response = client.post("/auth/login", json={
        "email": email,  # 랜덤 생성된 이메일 사용
        "password": "Password123!"
    })
    assert login_response.status_code == 200, "Login failed"
    tokens = login_response.json()
    return tokens["access_token"]

def test_update_profile_nickname_and_image(db_session: Session):
    access_token = get_access_token(db_session)

    new_profile_data = {
        "nickname": "새닉네임",
        "profile_image_url": "https://example.com/new-profile.jpg"
    }
    response = client.patch(
        "/users/me",
        headers={"Authorization": f"Bearer {access_token}"},
        json=new_profile_data
    )

    assert response.status_code == 200
    data = response.json()
    assert data["nickname"] == new_profile_data["nickname"]
    assert data["profile_image_url"] == new_profile_data["profile_image_url"]

def test_update_profile_nickname_only(db_session: Session):
    access_token = get_access_token(db_session)

    nickname_update = {
        "nickname": "닉네임만수정"
    }
    response = client.patch(
        "/users/me",
        headers={"Authorization": f"Bearer {access_token}"},
        json=nickname_update
    )

    assert response.status_code == 200
    data = response.json()
    assert data["nickname"] == nickname_update["nickname"]

def test_update_profile_image_only(db_session: Session):
    access_token = get_access_token(db_session)

    image_update = {
        "profile_image_url": "https://example.com/only-profile.jpg"
    }
    response = client.patch(
        "/users/me",
        headers={"Authorization": f"Bearer {access_token}"},
        json=image_update
    )

    assert response.status_code == 200
    data = response.json()
    assert data["profile_image_url"] == image_update["profile_image_url"]
