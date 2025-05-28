# backend/scripts/import_recipes.py

from typing import List, Dict, Any
import requests
from dotenv import load_dotenv
import os
from sqlalchemy.orm import Session
from backend.app.utils.ingredient_parser import parse_openapi_ingredients
from backend.db import SessionLocal
from backend import crud, schemas, models

load_dotenv()
API_KEY = os.getenv("FOOD_API_KEY")

FALLBACK_KEYWORDS = {
    "김치찌개": "찌개",
    "된장찌개": "찌개",
    "고등어조림": "고등어",
    "갈비찜": "찜",
    "김치전": "전",
    "잔치국수": "국수",
}

FOOD_NAMES = ["닭볶음탕", "잔치국수", "고등어조림", "갈비찜", "김밥", "김치전", "김치찌개", "미역국", "된장찌개"]

def fetch_recipes(food_name: str) -> List[Dict[str, Any]]:
    def _call_api(name: str) -> List[Dict[str, Any]]:
        url = f"https://openapi.foodsafetykorea.go.kr/api/{API_KEY}/COOKRCP01/json/1/100/RCP_NM={name}"
        resp = requests.get(url)
        if resp.status_code != 200:
            return []
        try:
            data = resp.json()
            return data.get("COOKRCP01", {}).get("row", [])
        except:
            return []

    recipes = _call_api(food_name)
    if recipes:
        return recipes

    fallback = FALLBACK_KEYWORDS.get(food_name)
    if fallback:
        print(f"\U0001f501 '{food_name}' → '{fallback}' 기원으로 재검색 중...")
        recipes = _call_api(fallback)
        return [r for r in recipes if food_name in r.get("RCP_NM", "")]

    print(f"⚠️ '{food_name}'에 대한 레시피 없음")
    return []

def delete_existing_data(db: Session, food_name: str):
    food = db.query(models.Food).filter(models.Food.name == food_name).first()
    if not food:
        return

    # 🔥 참조 관계 먼저 삭제
    recipes = db.query(models.Recipe).filter(models.Recipe.food_id == food.id).all()
    for recipe in recipes:
        db.query(models.UserIngredientInputRecipe).filter(
            models.UserIngredientInputRecipe.recipe_id == recipe.id
        ).delete()
        db.query(models.RecipeStep).filter(
            models.RecipeStep.recipe_id == recipe.id
        ).delete()
        db.query(models.DetectionResult).filter(
            models.DetectionResult.food_id == food.id
        ).delete()

    # 🔥 레시피 삭제
    db.query(models.Recipe).filter(models.Recipe.food_id == food.id).delete()
    db.delete(food)
    db.commit()
    print(f"🗑 {food_name} 삭제 완료")

def parse_and_insert(food_name: str, recipes: List[Dict[str, Any]], db: Session):
    food = crud.get_or_create_food(db, name=food_name)

    for r in recipes:
        # 재료나 조리법이 없는 레시피는 skip
        if not r.get("RCP_PARTS_DTLS") or all(not r.get(f"MANUAL{i:02d}") for i in range(1, 21)):
            print(f"⚠️ '{r.get('RCP_NM')}' 레시피는 유효하지 않아 스킵됨")
            continue

        cleaned = parse_openapi_ingredients(r.get("RCP_PARTS_DTLS") or "")

        recipe = crud.get_or_create_recipe(db, schemas.RecipeCreate(
            food_id=food.id,
            source_type="public",
            title=r.get("RCP_NM") or "제목 없음",
            ingredients=r.get("RCP_PARTS_DTLS") or "",
            instructions=" ".join([r.get(f"MANUAL{i:02d}", "") for i in range(1, 21)]).strip(),
            source_detail="식품안전나라 OpenAPI",
            ingredients_cleaned=cleaned 
        ))

        for i in range(1, 21):
            step_text = r.get(f"MANUAL{i:02d}")
            step_img = r.get(f"MANUAL_IMG{i:02d}")
            if step_text:
                crud.create_recipe_step(db, schemas.RecipeStepCreate(
                    recipe_id=recipe.id,
                    step_order=i,
                    description=step_text.strip(),
                    image_url=step_img.strip() if step_img else None
                ))

def main():
    db = SessionLocal()
    for food_name in FOOD_NAMES:
        print(f"\n🧹 {food_name} → 기존 데이터 삭제 중...")
        delete_existing_data(db, food_name)

        print(f"🍳 {food_name} → API 호출 중...")
        recipes = fetch_recipes(food_name)

        if not recipes:
            print(f"⚠️ '{food_name}'에 해당하는 레시피 없음")
            continue

        parse_and_insert(food_name, recipes, db)

    db.close()
    print("✅ 레시피 수집 및 저장 완료")

if __name__ == "__main__":
    main()
