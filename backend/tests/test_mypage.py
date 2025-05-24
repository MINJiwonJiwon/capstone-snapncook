# backend/tests/test_mypage.py

from typing import Any, Dict
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from backend.models import User
from backend.tests.test_food import create_food_helper
from backend.tests.test_recipe import create_recipe_helper

def test_mypage_summary(auth_client: TestClient, db_session: Session, test_user: User):
    # 음식 및 레시피 생성
    food_id = create_food_helper(db_session)
    recipe_id = create_recipe_helper(db_session, food_id=food_id)

    # 북마크 등록
    response = auth_client.post("/api/bookmarks/", json={"recipe_id": recipe_id})
    assert response.status_code == 200

    # 탐지 결과 등록
    detection_data: Dict[str, Any] = {
        "food_id": food_id,
        "image_path": "path/to/image.jpg",
        "confidence": 0.88
    }
    response = auth_client.post("/api/detection-results/", json=detection_data)
    assert response.status_code == 200

    # 리뷰 작성
    review_data: Dict[str, Any] = {
        "food_id": food_id,
        "content": "맛있어요!",
        "rating": 5
    }
    response = auth_client.post("/api/reviews/", json=review_data)
    assert response.status_code == 200

    # 마이페이지 요약 호출
    response = auth_client.get("/api/mypage/summary")
    assert response.status_code == 200

    data = response.json()
    assert "bookmarks" in data
    assert "detection_results" in data
    assert "reviews" in data

    assert len(data["bookmarks"]) == 1
    assert len(data["detection_results"]) == 1
    assert len(data["detection_results"]) <= 5
    assert len(data["reviews"]) == 1

    assert "recipe_thumbnail" in data["bookmarks"][0]
    assert "food_image_url" in data["reviews"][0]
