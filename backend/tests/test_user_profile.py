# backend/tests/test_user_profile.py

from uuid import uuid4
import pytest
from fastapi.testclient import TestClient
from backend import models
from backend.app.auth.utils import create_access_token
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

def test_delete_current_user(db_session: Session):
    # 1. 유저 생성 및 로그인
    access_token = get_access_token(db_session)

    # 2. 회원 탈퇴 요청
    response = client.delete(
        "/users/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    # 3. 응답 코드 확인
    assert response.status_code == 204

    # 4. 탈퇴 후 다시 내 정보 조회 시 401 Unauthorized 기대
    response_after_delete = client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response_after_delete.status_code in [401, 404, 422]

def test_change_password(db_session: Session):
    # 1. 유저 생성 및 로그인
    user_id, email = test_create_user(db_session)

    login_response = client.post("/auth/login", json={
        "email": email,
        "password": "Password123!"
    })
    assert login_response.status_code == 200
    access_token = login_response.json()["access_token"]

    # 2. 비밀번호 변경 요청
    response = client.patch(
        "/users/me/password",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "current_password": "Password123!",
            "new_password": "NewPassword456!"
        }
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Password updated successfully"

    # 3. 새 비밀번호로 로그인 시도
    login_response_after = client.post("/auth/login", json={
        "email": email,
        "password": "NewPassword456!"
    })
    assert login_response_after.status_code == 200

def test_get_social_status(db_session: Session):
    access_token = get_access_token(db_session)

    response = client.get(
        "/users/me/social",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200
    data = response.json()

    # 일반 로그인 유저면 null이 반환됨
    assert "oauth_provider" in data
    assert "oauth_id" in data
    assert data["oauth_provider"] is None
    assert data["oauth_id"] is None

def test_disconnect_social_account_fails_for_non_social_user(db_session: Session):
    access_token = get_access_token(db_session)

    # 일반 로그인 유저는 연동이 없으므로 실패해야 함
    response = client.delete(
        "/users/me/social/google",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "No such social provider connected"

def test_disconnect_social_account_success(db_session: Session):
    unique_email = f"socialuser{uuid4()}@example.com"

    user = models.User(
        email=unique_email,
        oauth_provider="google",
        oauth_id="mock-oauth-id",
        nickname="소셜유저"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    token = create_access_token({"sub": str(user.id)})

    response = client.delete(
        "/users/me/social/google",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["message"] == "google 연동이 해제되었습니다."

    response_check = client.get(
        "/users/me/social",
        headers={"Authorization": f"Bearer {token}"}
    )
    data = response_check.json()
    assert data["oauth_provider"] is None
    assert data["oauth_id"] is None
    