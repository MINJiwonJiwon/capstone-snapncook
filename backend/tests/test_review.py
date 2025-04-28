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
