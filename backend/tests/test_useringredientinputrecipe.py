# backend/tests/test_useringredientinputrecipe.py

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.db import get_db
from sqlalchemy.orm import Session

from backend.tests.test_user import test_create_user
from backend.tests.test_useringredientinput import create_user_ingredient_input
from backend.tests.test_recipe import test_create_recipe

client = TestClient(app)

@pytest.fixture(scope="function")
def db_session():
    db: Session = next(get_db())
    db.begin()
    yield db
    db.rollback()

def test_create_user_ingredient_input_recipe(db_session: Session):
    """user_ingredient_input_recipe 데이터 생성 테스트"""
    # 1. user 먼저 생성
    user_id = test_create_user(db_session)
    
    # 2. user_ingredient_input 생성
    input_id = create_user_ingredient_input(db_session, user_id)
    
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

def test_get_recipes_by_input_id(db_session: Session):
    """user_ingredient_input_id를 통해 연결된 recipe들 가져오기"""
    user_id = test_create_user(db_session)
    input_id = create_user_ingredient_input(db_session, user_id)
    recipe_id = test_create_recipe(db_session)

    # 먼저 user_ingredient_input_recipe 데이터를 생성
    client.post("/user-ingredient-input-recipes/", json={
        "input_id": input_id,
        "recipe_id": recipe_id,
        "rank": 1
    })

    # 해당 input_id에 연결된 레시피들을 조회
    response = client.get(f"/user-ingredient-input-recipes/input/{input_id}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)  # 리스트 형식으로 결과가 반환되는지 확인
