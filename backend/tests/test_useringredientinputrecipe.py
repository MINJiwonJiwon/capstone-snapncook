# backend/tests/test_useringredientinputrecipe.py

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.db import get_db
from sqlalchemy.orm import Session

from backend.tests.test_user import test_create_user
from backend.tests.test_recipe import test_create_recipe

client = TestClient(app)

@pytest.fixture(scope="function")
def db_session():
    db: Session = next(get_db())
    db.begin()
    yield db
    db.rollback()

# user_ingredient_input과 user_ingredient_input_recipe 데이터 생성 테스트
def test_create_user_ingredient_input_recipe(db_session: Session):
    # 1. user 생성
    user_id = test_create_user(db_session)
    assert user_id is not None, "user_id 생성 실패"

    # 2. user_ingredient_input 생성
    input_data = {
        "user_id": user_id,
        "input_text": "김치, 돼지고기, 마늘"
    }
    input_response = client.post("/user-ingredient-inputs/", json=input_data)
    assert input_response.status_code in [200, 201], f"input 생성 실패: {input_response.status_code}"
    input_response_json = input_response.json()
    assert "id" in input_response_json, "input_response에 id 없음"
    input_id = input_response_json["id"]
    assert input_id is not None, "input_id 생성 실패"

    # 3. recipe 생성
    recipe_id = test_create_recipe(db_session)
    assert recipe_id is not None, "recipe_id 생성 실패"

    # 4. user_ingredient_input_recipe 생성
    input_recipe_data = {
        "input_id": input_id,
        "recipe_id": recipe_id,
        "rank": 1
    }
    response = client.post("/user-ingredient-input-recipes/", json=input_recipe_data)
    assert response.status_code == 200, f"input_recipe 생성 실패: {response.status_code}"
    response_json = response.json()
    assert "rank" in response_json, "response에 rank 없음"
    assert response_json["rank"] == input_recipe_data["rank"], "rank 값 불일치"
