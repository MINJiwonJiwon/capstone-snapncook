# backend/tests/test_mypage.py

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.db import get_db
from sqlalchemy.orm import Session
from backend.tests.test_user import test_create_user
from backend.tests.test_food import test_create_food
from backend.tests.test_recipe import test_create_recipe

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

def test_mypage_summary(db_session: Session):
    access_token, user_id = get_access_token(db_session)

    # 음식 및 레시피 생성
    food_id = test_create_food(db_session)
    recipe_id = test_create_recipe(db_session, food_id=food_id)

    # 북마크 등록
    client.post(
        "/bookmarks/",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"recipe_id": recipe_id}
    )

    # Detection 등록
    detection_data = {
        "user_id": user_id,
        "food_id": food_id,
        "image_path": "path/to/image.jpg",
        "confidence": 0.88
    }
    client.post("/detection-results/", json=detection_data)

    # 리뷰 작성
    review_data = {
        "user_id": user_id,
        "food_id": food_id,
        "content": "맛있어요!",
        "rating": 5
    }
    client.post("/reviews/", json=review_data)

    # 마이페이지 요약 호출
    response = client.get("/mypage/summary", headers={"Authorization": f"Bearer {access_token}"})
    assert response.status_code == 200

    data = response.json()
    assert "bookmarks" in data
    assert "detection_results" in data
    assert "reviews" in data

    assert len(data["bookmarks"]) == 1
    assert len(data["detection_results"]) == 1
    assert len(data["detection_results"]) <= 5
    assert len(data["reviews"]) == 1
