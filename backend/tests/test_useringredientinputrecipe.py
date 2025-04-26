# backend/tests/test_useringredientinputrecipe.py

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_create_user_ingredient_input_recipe():
    input_recipe_data = {
        "input_id": 1,
        "recipe_id": 1,
        "rank": 1
    }
    response = client.post("/user-ingredient-input-recipes/", json=input_recipe_data)
    assert response.status_code == 200
    assert response.json()["rank"] == input_recipe_data["rank"]

def test_get_recipes_by_input_id():
    response = client.get("/user-ingredient-input-recipes/input/1")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
