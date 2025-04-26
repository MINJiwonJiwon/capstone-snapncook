# backend/tests/test_food.py

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.db import get_db
from sqlalchemy.orm import Session

client = TestClient(app)

@pytest.fixture(scope="function")
def db_session():
    db: Session = next(get_db())
    db.begin()
    yield db
    db.rollback()

def test_create_food(db_session: Session):
    food_data = {
        "name": "김치찌개",  
        "description": "얼큰한 국물요리"
    }
    response = client.post("/foods/", json=food_data)
    assert response.status_code == 200
    assert response.json()["name"] == food_data["name"]
    assert response.json()["description"] == food_data["description"]
    
    food_id = response.json()["id"]
    return food_id

def test_get_food_by_id(db_session: Session):
    food_id = test_create_food(db_session)
    response = client.get(f"/foods/{food_id}")
    
    assert response.status_code == 200
    assert response.json()["id"] == food_id
    assert response.json()["name"] == "김치찌개"
    assert response.json()["description"] == "얼큰한 국물요리"
