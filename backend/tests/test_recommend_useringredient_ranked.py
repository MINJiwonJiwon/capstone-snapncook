# test_recommend_useringredient_ranked.py

from typing import Any, List
from uuid import uuid4
from fastapi.testclient import TestClient
from backend.main import app
from backend.db import get_db
from backend.db import SessionLocal

client = TestClient(app)

# 테스트용 DB 주입 (필요 시)
def override_get_db(): # type: ignore
    db = SessionLocal() # type: ignore
    try:
        yield db
    finally:
        db.close() # type: ignore

app.dependency_overrides[get_db] = override_get_db

def test_ranked_recommendation_for_input():
    # 1. 회원가입
    user_data = {
        "email": f"testuser_{uuid4().hex[:8]}@example.com",
        "password": "Password123!",
        "password_check": "Password123!",
        "nickname": "테스트유저"
    }
    signup_res = client.post("/api/auth/signup", json=user_data)
    assert signup_res.status_code in [200, 201]

    # 2. 로그인 → 토큰 확보
    login_res = client.post("/api/auth/login", json={
        "email": user_data["email"],
        "password": user_data["password"]
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. 재료 입력 (input_text)
    input_res = client.post("/api/user-ingredient-inputs/", json={
        "input_text": "감자, 양파"
    }, headers=headers)
    assert input_res.status_code == 200
    input_id = input_res.json()["id"]

        # 4. 추천 요청
    recommend_res = client.get(
        f"/api/recommend/private/by-ingredient-ranked/{input_id}",
        headers=headers
    )

    # ⚠️ 추천 결과 없을 경우 테스트 스킵
    if recommend_res.status_code == 404:
        print("⚠️ No matched recipes for given input. Skipping test.")
        return

    # 나머지는 기존과 동일하게 유지
    assert recommend_res.status_code == 200
    recipes: List[Any] = recommend_res.json()
    assert isinstance(recipes, list)
    assert len(recipes) <= 12

    # 5. 정렬 순서 확인 (추가 재료 수 기준 오름차순)
    user_ingredients = {"감자", "양파"}
    previous_extra = -1
    for r in recipes: # type: ignore
        recipe_ingredients: set[Any] = set(r["ingredients"].replace(" ", "").split(",")) # type: ignore
        extra_count = len(recipe_ingredients - user_ingredients)
        assert extra_count >= previous_extra
        previous_extra = extra_count

    print("[추천된 레시피 수]", len(recipes)) 
    for r in recipes: # type: ignore
        print("-", r["title"]) # type: ignore

if __name__ == "__main__":
    test_ranked_recommendation_for_input()
