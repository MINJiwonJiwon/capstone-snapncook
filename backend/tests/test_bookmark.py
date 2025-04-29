# backend/tests/test_bookmark.py

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.db import get_db
from sqlalchemy.orm import Session
from backend.tests.test_user import test_create_user
from backend.tests.test_recipe import test_create_food, test_create_recipe

client = TestClient(app)

@pytest.fixture(scope="function")
def db_session():
    db: Session = next(get_db())
    db.begin()
    yield db
    db.rollback()

def get_access_token(db_session: Session):
    user_id, email = test_create_user(db_session)
    login_response = client.post("/auth/login", json={
        "email": email,
        "password": "Password123!"
    })
    assert login_response.status_code == 200
    return login_response.json()["access_token"], user_id

def test_bookmark_flow(db_session: Session):
    # 1. 유저 생성 및 로그인
    access_token, user_id = get_access_token(db_session)

    # 2. 음식 + 레시피 생성
    food_id = test_create_food(db_session)
    recipe_id = test_create_recipe(db_session, food_id=food_id)

    # 3. 북마크 추가
    response = client.post(
        "/bookmarks/",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"recipe_id": recipe_id}
    )
    assert response.status_code == 200
    bookmark_id = response.json()["id"]

    # 4. 내 북마크 목록 조회
    response = client.get(
        "/bookmarks/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200
    assert any(bm["id"] == bookmark_id for bm in response.json())

    # 5. 북마크 삭제
    response = client.delete(
        f"/bookmarks/{bookmark_id}",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 204

    # 6. 삭제 후 북마크 목록 조회
    response = client.get(
        "/bookmarks/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200
    assert all(bm["id"] != bookmark_id for bm in response.json())
