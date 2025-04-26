# backend/tests/test_food.py

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_create_food():
    food_data = {
        "name": "김치찌개",  
        "description": "얼큰한 국물요리"
    }
    response = client.post("/foods/", json=food_data)
    assert response.status_code == 200
    assert response.json()["name"] == food_data["name"]
    assert response.json()["description"] == food_data["description"]

def test_get_all_foods():
    response = client.get("/foods/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_food_by_id():
    # 먼저 음식을 만들어야 하기 때문에, create_food 테스트 후 사용
    food_data = {
        "name": "불고기",  # 불고기로 변경
        "description": "달콤하고 고소한 소고기 요리"
    }
    create_response = client.post("/foods/", json=food_data)
    food_id = create_response.json()["id"]

    response = client.get(f"/foods/{food_id}")
    assert response.status_code == 200
    assert response.json()["id"] == food_id
    assert response.json()["name"] == food_data["name"]
    assert response.json()["description"] == food_data["description"]
