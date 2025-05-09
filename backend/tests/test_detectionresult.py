# backend/tests/test_detectionresult.py

import pytest
from backend.tests.test_food import create_food_helper

# 탐지 결과 생성 테스트
def test_create_detection_result(auth_client, db_session, test_user):
    food_id = create_food_helper(db_session)

    detection_data = {
        "food_id": food_id,
        "image_path": "/path/to/image.jpg",
        "confidence": 0.95
    }
    response = auth_client.post("/api/detection-results/", json=detection_data)
    assert response.status_code == 200
    assert response.json()["confidence"] == detection_data["confidence"]

# 탐지 결과 조회 테스트
def test_get_detection_results(auth_client, db_session, test_user):
    food_id = create_food_helper(db_session)

    detection_data = {
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
def test_create_detection_result_with_invalid_food_id(auth_client):
    invalid_detection = {
        "food_id": 99999,  # 존재하지 않는 음식 ID
        "image_path": "uploads/test.jpg",
        "confidence": 0.95
    }

    response = auth_client.post("/api/detection-results/", json=invalid_detection)

    assert response.status_code == 400
    assert response.json()["detail"]["error_code"] == "FOOD_NOT_FOUND"
    assert "등록되어 있지 않습니다" in response.json()["detail"]["message"]
