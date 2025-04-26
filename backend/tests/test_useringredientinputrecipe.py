# backend/tests/test_useringredientinputrecipe.py

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

def test_create_user_ingredient_input_recipe(db_session: Session):
    input_recipe_data = {
        "input_id": 1,
        "recipe_id": 1,
        "rank": 1
    }
    response = client.post("/user-ingredient-input-recipes/", json=input_recipe_data)
    assert response.status_code == 200
    assert response.json()["rank"] == input_recipe_data["rank"]

def test_get_recipes_by_input_id(db_session: Session):
    response = client.get("/user-ingredient-input-recipes/input/1")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
