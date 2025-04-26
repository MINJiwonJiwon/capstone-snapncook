# backend/tests/test_detectionresult.py

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_create_detection_result():
    detection_data = {
        "user_id": 1,
        "food_id": 1,
        "image_path": "/path/to/image.jpg",
        "confidence": 0.95
    }
    response = client.post("/detection-results/", json=detection_data)
    assert response.status_code == 200
    assert response.json()["confidence"] == detection_data["confidence"]

def test_get_detection_results():
    response = client.get("/detection-results/user/1")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
