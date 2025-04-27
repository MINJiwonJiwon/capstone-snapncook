# backend/tests/test_detectionresult.py

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

# 탐지 결과 생성 테스트
def test_create_detection_result(db_session: Session):
    user_id = test_create_user(db_session)
    food_id = test_create_food(db_session)

    detection_data = {
        "user_id": user_id,
        "food_id": food_id,
        "image_path": "/path/to/image.jpg",
        "confidence": 0.95
    }
    response = client.post("/detection-results/", json=detection_data)
    assert response.status_code == 200
    assert response.json()["confidence"] == detection_data["confidence"]

# 탐지 결과 조회 테스트
def test_get_detection_results(db_session: Session):
    # 여기서도 user + food + detection_result 생성
    user_id = test_create_user(db_session)
    food_id = test_create_food(db_session)

    detection_data = {
        "user_id": user_id,
        "food_id": food_id,
        "image_path": "/path/to/image2.jpg",
        "confidence": 0.85
    }
    create_response = client.post("/detection-results/", json=detection_data)
    assert create_response.status_code == 200

    # 생성한 유저 id로 조회
    response = client.get(f"/detection-results/user/{user_id}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 1
    