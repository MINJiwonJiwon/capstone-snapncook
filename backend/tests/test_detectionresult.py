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
    user_id = test_create_user(db_session)  # 유저 생성 후 user_id 사용
    food_id = test_create_food(db_session)  # 음식 생성 후 food_id 사용
    
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
    response = client.get("/detection-results/user/1")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
