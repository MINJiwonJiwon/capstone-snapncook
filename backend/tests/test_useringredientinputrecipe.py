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

def test_create_user_ingredient_input_recipe(authenticated_headers, db_session: Session):
    # 1. user_ingredient_input 생성
    input_data = {
        "input_text": "김치, 돼지고기, 마늘"
    }
    input_response = client.post("/user-ingredient-inputs/", json=input_data, headers=authenticated_headers)
    assert input_response.status_code in [200, 201], f"input 생성 실패: {input_response.status_code}"
    input_id = input_response.json()["id"]

    # 2. recipe 생성
    from backend.tests.test_recipe import create_food_helper, create_recipe_helper
    food_id = create_food_helper(db_session)
    recipe_id = create_recipe_helper(db_session, food_id=food_id)

    # 3. user_ingredient_input_recipe 생성
    input_recipe_data = {
        "input_id": input_id,
        "recipe_id": recipe_id,
        "rank": 1
    }
    response = client.post("/user-ingredient-input-recipes/", json=input_recipe_data, headers=authenticated_headers)
    assert response.status_code == 200
    assert response.json()["rank"] == 1
