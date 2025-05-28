# backend/app/services/matching.py

from backend import models
from sqlalchemy.orm import Session
from typing import List, Set

def clean_input_ingredients(input_text: str) -> Set[str]:
    """
    사용자 입력 텍스트를 파싱해서 재료 Set으로 반환
    """
    parts: List[str] = []
    for line in input_text.splitlines():
        for token in line.split(','):
            token = token.strip()
            if token:
                parts.append(token)
    return set(parts)

def auto_match_foods_from_input(input_text: str, db: Session) -> List[int]:
    """
    사용자 입력 재료를 기반으로, ingredients_cleaned에 1개라도 포함된 레시피의 food_id를 반환
    """
    user_ingredients: Set[str] = clean_input_ingredients(input_text)
    if not user_ingredients:
        return []

    matched_food_ids: Set[int] = set()

    recipes: List[models.Recipe] = db.query(models.Recipe).all()
    for recipe in recipes:
        if not recipe.ingredients_cleaned:
            continue
        recipe_ingredients: Set[str] = set(recipe.ingredients_cleaned)
        if user_ingredients & recipe_ingredients:
            matched_food_ids.add(recipe.food_id)

    return list(matched_food_ids)

def rank_recipes_by_extra_ingredients(input_text: str, db: Session) -> List[models.Recipe]:
    user_ingredients = clean_input_ingredients(input_text)
    if not user_ingredients:
        return []

    ranked: List[tuple[int, models.Recipe]] = []

    recipes = db.query(models.Recipe).all()
    for recipe in recipes:
        if not recipe.ingredients_cleaned:
            continue

        recipe_set = set(recipe.ingredients_cleaned)
        extra_needed = len(recipe_set - user_ingredients)
        ranked.append((extra_needed, recipe))

    # 추가 재료 수 기준으로 정렬 (오름차순)
    ranked.sort(key=lambda x: x[0])
    return [r for _, r in ranked]