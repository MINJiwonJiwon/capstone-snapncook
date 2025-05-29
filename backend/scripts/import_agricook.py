# backend/scripts/import_agricook.py

from typing import Any, Dict, List
import pandas as pd
from pandas import Series
from sqlalchemy.orm import Session
from backend.db import SessionLocal
from backend import crud, schemas, models
from backend.app.utils.ingredient_parser import parse_agricook_ingredients
import re

# ✅ 유효한 CSV 파일만 사용 (UTF-8 성공한 것만)
CSV_PATHS = [
    "backend/data/TB_RECIPE_SEARCH_241226.csv",
]

# 삽입할 음식 이름 목록 (AI 탐지 기준)
FOOD_NAMES = [
    "닭볶음탕", "잔치국수", "고등어조림", "갈비찜",
    "김밥", "김치전", "김치찌개", "미역국", "된장찌개"
]

MAX_STEPS = 20

def load_recipes_from_csvs() -> pd.DataFrame:
    dfs: List[pd.DataFrame] = []

    for path in CSV_PATHS:
        try:
            df = pd.read_csv(path, encoding="utf-8").fillna("") # type: ignore
            print(f"✅ {path} - UTF-8 인코딩 성공")
            dfs.append(df)
        except Exception as e:
            print(f"❌ {path} - 로딩 실패: {e}")

    return pd.concat(dfs, ignore_index=True)

def extract_steps(row: Series[Any]) -> List[Dict[str, Any]]:
    steps: List[Dict[str, Any]] = []
    for i in range(1, MAX_STEPS + 1):
        desc = row.get(f"만드는법_{i:02d}")
        img = row.get(f"만드는법_이미지_{i:02d}")
        if desc:
            steps.append({
                "order": i,
                "description": re.sub(r"[a-cA-C]\s*$", "", str(desc)).strip(),
                "image_url": img.strip() if img else None
            })
    return steps

def insert_from_csv(db: Session):
    df = load_recipes_from_csvs()
    inserted_count = 0

    for _, row in df.iterrows(): # type: ignore
        row: Series[Any]
        food_name = row["CKG_NM"].strip()
        recipe_title = row["RCP_TTL"].strip()

        if food_name not in FOOD_NAMES:
            continue

        food = crud.get_or_create_food(db, name=food_name)

        existing = db.query(models.Recipe).filter(
            models.Recipe.food_id == food.id,
            models.Recipe.title == recipe_title
        ).first()
        if existing:
            continue

        cleaned = parse_agricook_ingredients(row["CKG_MTRL_CN"])

        recipe = crud.create_recipe(db, schemas.RecipeCreate(
            food_id=food.id,
            source_type="agricook",
            title=recipe_title,
            ingredients=row["CKG_MTRL_CN"],
            instructions=row["CKG_IPDC"],
            source_detail="농식품빅데이터거래소",
            ingredients_cleaned=cleaned
        ))

        steps = extract_steps(row)
        for step in steps:
            crud.create_recipe_step(db, schemas.RecipeStepCreate(
                recipe_id=recipe.id,
                step_order=step["order"],
                description=step["description"],
                image_url=step["image_url"]
            ))
            
        inserted_count += 1

    print(f"✅ 총 {inserted_count}개의 레시피가 삽입되었습니다.")

def main():
    db = SessionLocal()
    insert_from_csv(db)
    db.close()

if __name__ == "__main__":
    main()
