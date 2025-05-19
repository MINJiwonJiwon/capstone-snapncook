# backend/tests/test_detectionresult.py

from typing import Any, Dict
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from backend.models import User
from backend.tests.test_food import create_food_helper

# 탐지 결과 생성 테스트
def test_create_detection_result(auth_client: TestClient, db_session: Session, test_user: User):
    food_id = create_food_helper(db_session)

    detection_data: Dict[str, Any] = {
        "food_id": food_id,
        "image_path": "/path/to/image.jpg",
        "confidence": 0.95
    }
    response = auth_client.post("/api/detection-results/", json=detection_data)
    assert response.status_code == 200
    assert response.json()["confidence"] == detection_data["confidence"]

# 탐지 결과 조회 테스트
def test_get_detection_results(auth_client: TestClient, db_session: Session, test_user: User):
    food_id = create_food_helper(db_session)

    detection_data: Dict[str, Any] = {
        "food_id": food_id,
        "image_path": "/path/to/image2.jpg",
        "confidence": 0.85
    }
    create_response = auth_client.post("/api/detection-results/", json=detection_data)
    assert create_response.status_code == 200

    # /me 경로로 조회
    response = auth_client.get("/api/detection-results/me")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert any(det["confidence"] == 0.85 for det in response.json())

# 없는 음식 탐지 테스트
def test_create_detection_result_with_invalid_food_id(auth_client: TestClient):
    invalid_detection: Dict[str, Any] = {
        "food_id": 99999,  # 존재하지 않는 음식 ID
        "image_path": "uploads/test.jpg",
        "confidence": 0.95
    }

    response = auth_client.post("/api/detection-results/", json=invalid_detection)

    assert response.status_code == 400
    assert response.json()["detail"]["error_code"] == "FOOD_NOT_FOUND"
    assert "등록되어 있지 않습니다" in response.json()["detail"]["message"]

# 빈 결과 확인 테스트
def test_get_detection_results_when_empty(auth_client: TestClient):
    # 먼저 사용자 계정은 있으나 탐지 결과가 없는 상태에서 호출
    response = auth_client.get("/api/detection-results/me")
    assert response.status_code == 200
    assert response.json() == []  # 빈 리스트 반환 확인
