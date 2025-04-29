# backend/tests/test_review.py

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.db import get_db
from sqlalchemy.orm import Session

from backend.tests.test_food import test_create_food
from backend.tests.test_user import test_create_user

client = TestClient(app)

@pytest.fixture(scope="function")
def db_session():
    db: Session = next(get_db())
    db.begin()
    yield db
    db.rollback()

def get_access_token_and_user(db_session: Session):
    user_id, email = test_create_user(db_session)
    login_response = client.post("/auth/login", json={
        "email": email,
        "password": "Password123!"
    })
    assert login_response.status_code == 200
    access_token = login_response.json()["access_token"]
    return access_token, user_id

def test_create_review(db_session: Session):
    user_id, _ = test_create_user(db_session)
    food_id = test_create_food(db_session)
    review_data = {
        "user_id": user_id,
        "food_id": food_id,
        "content": "이 김치찌개 정말 맛있어요!",
        "rating": 5
    }
    response = client.post("/reviews/", json=review_data)
    assert response.status_code == 200
    assert response.json()["content"] == review_data["content"]

def test_get_reviews_by_food(db_session: Session):
    response = client.get("/reviews/food/1")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_update_review(db_session: Session):
    access_token, user_id = get_access_token_and_user(db_session)
    food_id = test_create_food(db_session)

    review_data = {
        "user_id": user_id,
        "food_id": food_id,
        "content": "초기 리뷰",
        "rating": 3
    }
    create_resp = client.post("/reviews/", json=review_data)
    assert create_resp.status_code == 200
    review_id = create_resp.json()["id"]

    update_data = {
        "content": "수정된 리뷰",
        "rating": 4
    }
    update_resp = client.patch(
        f"/reviews/{review_id}",
        headers={"Authorization": f"Bearer {access_token}"},
        json=update_data
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["content"] == "수정된 리뷰"
    assert update_resp.json()["rating"] == 4

def test_delete_review(db_session: Session):
    access_token, user_id = get_access_token_and_user(db_session)
    food_id = test_create_food(db_session)

    review_data = {
        "user_id": user_id,
        "food_id": food_id,
        "content": "삭제할 리뷰",
        "rating": 5
    }
    create_resp = client.post("/reviews/", json=review_data)
    assert create_resp.status_code == 200
    review_id = create_resp.json()["id"]

    delete_resp = client.delete(
        f"/reviews/{review_id}",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert delete_resp.status_code == 204

    get_resp = client.get(f"/reviews/user/{user_id}")
    assert all(rv["id"] != review_id for rv in get_resp.json())
