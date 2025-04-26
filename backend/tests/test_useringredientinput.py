# backend/tests/test_useringredientinput.py

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_create_user_ingredient_input():
    input_data = {
        "user_id": 1,
        "input_text": "tomato, cheese, dough",
        "matched_food_ids": [1]
    }
    response = client.post("/user-ingredient-inputs/", json=input_data)
    assert response.status_code == 200
    assert response.json()["input_text"] == input_data["input_text"]

def test_get_user_ingredient_input():
    response = client.get("/user-ingredient-inputs/1")
    assert response.status_code == 200
    assert response.json()["id"] == 1
