# backend/tests/test_review.py

from typing import Any, Dict
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from backend.models import User
from backend.tests.test_food import create_food_helper

def test_create_review(auth_client: TestClient, db_session: Session, test_user: User):
    food_id = create_food_helper(db_session)
    review_data: Dict[str, Any] = {
        "food_id": food_id,
        "content": "이 김치찌개 정말 맛있어요!",
        "rating": 5
    }
    response = auth_client.post("/api/reviews/", json=review_data)
    assert response.status_code == 200
    assert response.json()["content"] == review_data["content"]

def test_get_reviews_by_food(auth_client: TestClient, db_session: Session, test_user: User):
    food_id = create_food_helper(db_session)

    # 리뷰 등록
    auth_client.post("/api/reviews/", json={
        "food_id": food_id,
        "content": "맛있어요",
        "rating": 4
    })

    # 조회
    response = auth_client.get(f"/api/reviews/food/{food_id}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 1

def test_update_review(auth_client: TestClient, db_session: Session, test_user: User):
    food_id = create_food_helper(db_session)

    # 리뷰 생성
    response = auth_client.post("/api/reviews/", json={
        "food_id": food_id,
        "content": "초기 리뷰",
        "rating": 3
    })
    review_id = response.json()["id"]

    # 리뷰 수정
    update_resp = auth_client.patch(f"/api/reviews/{review_id}", json={
        "content": "수정된 리뷰",
        "rating": 4
    })
    assert update_resp.status_code == 200
    assert update_resp.json()["content"] == "수정된 리뷰"
    assert update_resp.json()["rating"] == 4

def test_delete_review(auth_client: TestClient, db_session: Session, test_user: User):
    food_id = create_food_helper(db_session)

    # 리뷰 생성
    response = auth_client.post("/api/reviews/", json={
        "food_id": food_id,
        "content": "삭제할 리뷰",
        "rating": 5
    })
    review_id = response.json()["id"]

    # 리뷰 삭제
    delete_resp = auth_client.delete(f"/api/reviews/{review_id}")
    assert delete_resp.status_code == 204

    # 삭제 확인 (내 리뷰 목록에서 조회 불가)
    get_resp = auth_client.get("/api/reviews/me")
    assert all(rv["id"] != review_id for rv in get_resp.json())
