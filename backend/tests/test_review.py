# backend/tests/test_review.py

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_create_review():
    review_data = {
        "user_id": 1,
        "food_id": 1,  # 예시로 1번 음식, 실제 DB에 맞게 수정
        "content": "이 김치찌개 정말 맛있어요!",  # 리뷰 내용 한국어로 변경
        "rating": 5
    }
    response = client.post("/reviews/", json=review_data)
    assert response.status_code == 200
    assert response.json()["content"] == review_data["content"]

def test_get_reviews_by_food():
    response = client.get("/reviews/food/1")  # 예시로 1번 음식, 실제 DB에 맞게 수정
    assert response.status_code == 200
    assert isinstance(response.json(), list)
