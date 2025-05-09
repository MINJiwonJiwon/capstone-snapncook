# backend/tests/test_recipe.py

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.db import get_db
from sqlalchemy.orm import Session

from backend.tests.test_food import create_food_helper
from backend.tests.test_user import test_create_user

client = TestClient(app)

@pytest.fixture(scope="function")
def db_session():
    db: Session = next(get_db())
    db.begin()
    yield db
    db.rollback()

def test_create_recipe(auth_client, db_session, test_user):
    food_id = create_food_helper(db_session)
    recipe_data = {
        "food_id": food_id,
        "source_type": "User",
        "title": "김치찌개 레시피",
        "ingredients": "김치, 돼지고기, 두부, 고춧가루",
        "instructions": "김치를 볶고 돼지고기와 두부를 넣고 끓인다.",
    }
    response = auth_client.post("/api/recipes/", json=recipe_data)
    assert response.status_code == 200
    assert response.json()["title"] == recipe_data["title"]

    return response.json()["id"]

def test_get_recipe_by_id(db_session: Session):
    food_id = create_food_helper(db_session)

    recipe_data = {
        "food_id": food_id,
        "source_type": "User",
        "title": "불고기 레시피",
        "ingredients": "소고기, 양파, 마늘, 간장",
        "instructions": "소고기를 양념하여 구운 후 양파와 함께 볶는다.",
    }

    create_response = client.post("/api/recipes/", json=recipe_data)
    assert create_response.status_code == 200
    recipe_id = create_response.json()["id"]

    response = client.get(f"/api/recipes/{recipe_id}")
    assert response.status_code == 200
    assert response.json()["id"] == recipe_id
    assert response.json()["title"] == recipe_data["title"]
    assert response.json()["food_id"] == food_id

def test_get_recipes_by_food_id(db_session: Session):
    food_id = create_food_helper(db_session)

    # food_id를 사용해서 레시피 생성
    recipe_data = {
        "food_id": food_id,
        "source_type": "User",
        "title": "된장찌개 레시피",
        "ingredients": "된장, 감자, 애호박",
        "instructions": "된장을 풀고 감자와 애호박을 넣고 끓인다.",
    }

    create_response = client.post("/api/recipes/", json=recipe_data)
    assert create_response.status_code == 200

    response = client.get(f"/api/recipes/food/{food_id}")
    assert response.status_code == 200
    recipes = response.json()
    assert isinstance(recipes, list)
    assert any(recipe["title"] == recipe_data["title"] for recipe in recipes)

# helper 함수
def create_recipe_helper(db_session, food_id: int):
    from backend import models
    recipe = models.Recipe(
        food_id=food_id,
        source_type="User",
        title="김치찌개 레시피",
        ingredients="김치, 돼지고기, 두부, 고춧가루",
        instructions="김치를 볶고 돼지고기와 두부를 넣고 끓인다."
    )
    db_session.add(recipe)
    db_session.commit()
    db_session.refresh(recipe)
    return recipe.id
