# backend/tests/test_bookmark.py

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from backend.models import User
from backend.tests.test_food import create_food_helper
from backend.tests.test_recipe import create_recipe_helper

# auth_client: 토큰 포함된 client
# test_user: 현재 로그인된 유저 객체

def test_bookmark_flow(auth_client: TestClient, db_session: Session, test_user: User):
    # 1. 음식 + 레시피 생성
    food_id = create_food_helper(db_session)
    recipe_id = create_recipe_helper(db_session, food_id)

    # 2. 북마크 추가
    response = auth_client.post("/api/bookmarks/", json={"recipe_id": recipe_id})
    assert response.status_code == 200
    bookmark_id = response.json()["id"]

    # 3. 내 북마크 목록 조회
    response = auth_client.get("/api/bookmarks/me")
    assert response.status_code == 200
    assert any(bm["id"] == bookmark_id for bm in response.json())

    # 4. 북마크 삭제
    response = auth_client.delete(f"/api/bookmarks/{bookmark_id}")
    assert response.status_code == 204

    # 5. 삭제 후 북마크 목록 조회
    response = auth_client.get("/api/bookmarks/me")
    assert response.status_code == 200
    assert all(bm["id"] != bookmark_id for bm in response.json())


def test_duplicate_bookmark(auth_client: TestClient, db_session: Session, test_user: User):
    # 1. 음식 & 레시피 생성
    food_id = create_food_helper(db_session)
    recipe_id = create_recipe_helper(db_session, food_id=food_id)

    # 2. 첫 북마크: 성공
    response = auth_client.post("/api/bookmarks/", json={"recipe_id": recipe_id})
    assert response.status_code == 200

    # 3. 중복 북마크: 실패
    response = auth_client.post("/api/bookmarks/", json={"recipe_id": recipe_id})
    assert response.status_code == 400
    assert response.json()["detail"] == "Already bookmarked this recipe."
