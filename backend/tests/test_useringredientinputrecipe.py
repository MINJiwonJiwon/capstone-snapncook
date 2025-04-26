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
    # 1. user 먼저 생성
    user_id = test_create_user(db_session)
    
    # 2. user_ingredient_input 생성
    input_data = {
        "user_id": user_id,
        "input_text": "김치, 돼지고기, 마늘"
    }
    input_response = client.post("/user-ingredient-inputs/", json=input_data)
    assert input_response.status_code in [200, 201]
    input_id = input_response.json()["id"]

    # 3. recipe 생성 (기존의 test_create_recipe 사용)
    recipe_id = test_create_recipe(db_session)

    # 4. 그 후 user_ingredient_input_recipe 생성
    input_recipe_data = {
        "input_id": input_id,
        "recipe_id": recipe_id,
        "rank": 1
    }
    response = client.post("/user-ingredient-input-recipes/", json=input_recipe_data)
    assert response.status_code == 200
    assert response.json()["rank"] == input_recipe_data["rank"]

# 테스트에 따라 추가적인 함수들도 동일하게 적용됩니다.
