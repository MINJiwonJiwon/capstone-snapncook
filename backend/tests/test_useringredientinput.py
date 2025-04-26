# backend/tests/test_useringredientinput.py

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

def test_create_user_ingredient_input(db_session: Session):
    user_data = {
        "email": "testuser@example.com",
        "password": "password123",
        "nickname": "테스트유저"
    }
    create_user_response = client.post("/auth/signup", json=user_data)
    user_id = create_user_response.json()["id"]
    
    input_data = {
        "user_id": user_id,
        "input_text": "tomato, cheese, dough",
        "matched_food_ids": [1]
    }
    response = client.post("/user-ingredient-inputs/", json=input_data)
    assert response.status_code == 200
    assert response.json()["input_text"] == input_data["input_text"]

def test_get_user_ingredient_input(db_session: Session):
    response = client.get("/user-ingredient-inputs/1")
    assert response.status_code == 200
    assert response.json()["id"] == 1

