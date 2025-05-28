# backend/tests/test_recommend_useringredient.py

from sqlalchemy.orm import Session
from backend.db import SessionLocal
from backend.models import UserIngredientInput, Recipe
from backend.app.services.matching import auto_match_foods_from_input
from backend.tests.test_user import test_create_user

def test_recommendation_flow():
    input_text = "감자, 양파"
    db: Session = SessionLocal()

    try:
        # ✅ 테스트용 유저 생성
        user_id, _, _ = test_create_user(db)

        print(f"[입력 재료] {input_text}")
        matched_ids = auto_match_foods_from_input(input_text, db)
        print(f"[매칭된 food_id 목록] {matched_ids}")

        if not matched_ids:
            print("❌ 매칭된 음식 없음")
            return

        test_input = UserIngredientInput(
            user_id=user_id,
            input_text=input_text,
            matched_food_ids=matched_ids
        )
        db.add(test_input)
        db.commit()
        db.refresh(test_input)

        print(f"[생성된 input_id] {test_input.id}")

        # 레시피 추천 (public API 동일한 로직)
        recipes = db.query(Recipe).filter(Recipe.food_id.in_(matched_ids)).all()
        print(f"[추천된 레시피 수] {len(recipes)}")
        for r in recipes:
            print(f" - {r.title}")

    finally:
        db.close()

if __name__ == "__main__":
    test_recommendation_flow()
