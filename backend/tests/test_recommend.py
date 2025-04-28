# backend/tests/test_recommend.py

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_recommend_by_detection():
    response = client.get("/recommend/recipes/by-detection/1")
    assert response.status_code in [200, 404]

def test_recommend_by_ingredient():
    response = client.get("/recommend/recipes/by-ingredient/2")
    assert response.status_code in [200, 400, 404]
