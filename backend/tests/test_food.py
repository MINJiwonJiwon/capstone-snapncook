from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_create_food():
    response = client.post("/foods/", json={
        "name": "김치찌개",
        "description": "얼큰한 국물요리"
    })
    assert response.status_code == 200
    assert response.json()["name"] == "김치찌개"

def test_get_all_foods():
    response = client.get("/foods/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
