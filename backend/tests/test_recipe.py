# backend/tests/test_recipe.py

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_create_recipe():
    recipe_data = {
        "food_id": 1,  # 음식 ID는 예시이므로 실제 DB에 맞는 값으로 테스트할 수 있음
        "source_type": "User",
        "title": "김치찌개 레시피",  # 김치찌개 레시피로 변경
        "ingredients": "김치, 돼지고기, 두부, 고춧가루",
        "instructions": "김치를 볶고 돼지고기와 두부를 넣고 끓인다.",
    }
    response = client.post("/recipes/", json=recipe_data)
    assert response.status_code == 200
    assert response.json()["title"] == recipe_data["title"]

def test_get_all_recipes():
    response = client.get("/recipes/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_recipe_by_id():
    # 먼저 레시피를 만들어야 하기 때문에, create_recipe 테스트 후 사용
    recipe_data = {
        "food_id": 1,  # 음식 ID는 예시
        "source_type": "User",
        "title": "불고기 레시피",  # 불고기 레시피로 변경
        "ingredients": "소고기, 양파, 마늘, 간장",
        "instructions": "소고기를 양념하여 구운 후 양파와 함께 볶는다.",
    }
    create_response = client.post("/recipes/", json=recipe_data)
    recipe_id = create_response.json()["id"]

    response = client.get(f"/recipes/{recipe_id}")
    assert response.status_code == 200
    assert response.json()["id"] == recipe_id
    assert response.json()["title"] == recipe_data["title"]
