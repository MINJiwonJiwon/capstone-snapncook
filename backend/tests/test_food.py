# backend/tests/test_food.py

import pytest
from backend.main import app
from fastapi.testclient import TestClient

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

    # ID 검증만 추가
    assert "id" in response.json()


def test_get_food_by_id():
    # 먼저 음식 하나 등록
    food_data = {
        "name": "된장찌개",
        "description": "구수한 된장 국물"
    }
    create_response = client.post("/foods/", json=food_data)
    food_id = create_response.json()["id"]

    # 등록된 음식 조회
    get_response = client.get(f"/foods/{food_id}")
    assert get_response.status_code == 200
    assert get_response.json()["id"] == food_id
    assert get_response.json()["name"] == food_data["name"]
    assert get_response.json()["description"] == food_data["description"]

# helper 함수
def create_food_helper(db_session):
    from backend import models
    food = models.Food(name="김치찌개", description="얼큰한 국물요리")
    db_session.add(food)
    db_session.commit()
    db_session.refresh(food)
    return food.id
