# backend/tests/test_recipe.py

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.db import get_db
from sqlalchemy.orm import Session

from backend.tests.test_food import test_create_food
from backend.tests.test_user import test_create_user

client = TestClient(app)

@pytest.fixture(scope="function")
def db_session():
    db: Session = next(get_db())
    db.begin()
    yield db
    db.rollback()

def test_create_recipe(db_session: Session):
    food_id = test_create_food(db_session)
    user_id = test_create_user(db_session)
    recipe_data = {
        "food_id": food_id,  
        "source_type": "User",
        "title": "김치찌개 레시피",  
        "ingredients": "김치, 돼지고기, 두부, 고춧가루",
        "instructions": "김치를 볶고 돼지고기와 두부를 넣고 끓인다.",
    }
    response = client.post("/recipes/", json=recipe_data)
    assert response.status_code == 200
    assert response.json()["title"] == recipe_data["title"]

def test_get_recipe_by_id(db_session: Session):
    # food 생성
    food_id = test_create_food(db_session)  # food_id 생성 후 사용

    # 레시피 데이터 생성
    recipe_data = {
        "food_id": food_id,  # food_id는 앞서 생성한 food_id
        "source_type": "User",
        "title": "불고기 레시피",
        "ingredients": "소고기, 양파, 마늘, 간장",
        "instructions": "소고기를 양념하여 구운 후 양파와 함께 볶는다.",
    }

    # 레시피 생성 요청
    create_response = client.post("/recipes/", json=recipe_data)
    assert create_response.status_code == 200  # 생성 성공 여부 확인
    recipe_id = create_response.json()["id"]  # 생성된 recipe_id 추출

    # 생성된 recipe_id로 레시피 조회
    response = client.get(f"/recipes/{recipe_id}")
    
    # 레시피 조회 결과 확인
    assert response.status_code == 200  # 조회 성공 여부 확인
    assert response.json()["id"] == recipe_id  # 응답에서 ID가 올바르게 반환되었는지 확인
    assert response.json()["title"] == recipe_data["title"]  # 제목이 일치하는지 확인
    assert response.json()["food_id"] == food_id  # food_id가 연결되었는지 확인
