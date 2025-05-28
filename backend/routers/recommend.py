# backend/routers/recommend.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import models, schemas
from backend.app.services.matching import clean_input_ingredients
from backend.db import get_db
from backend.app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/recommend",
    tags=["Recommendation"]
)

# ==========================
# 🔓 공개용 추천 API (로그인 없이 사용)
# ==========================

@router.get(
    "/public/by-detection/{detection_id}",
    response_model=List[schemas.RecipeOut],
    summary="🔓 공개 - 탐지 결과 기반 추천",
    description="로그인하지 않아도 AI 탐지 결과 ID로 레시피 추천을 받을 수 있습니다."
)
def public_recommend_by_detection(
    detection_id: int,
    db: Session = Depends(get_db)
):
    detection = db.query(models.DetectionResult).filter(models.DetectionResult.id == detection_id).first()
    if not detection:
        raise HTTPException(status_code=404, detail="Detection result not found")

    recipes = db.query(models.Recipe).filter(models.Recipe.food_id == detection.food_id).all()
    if not recipes:
        raise HTTPException(status_code=404, detail="No recipes found for detected food")
    return recipes


@router.get(
    "/public/by-ingredient/{input_id}",
    response_model=List[schemas.RecipeOut],
    summary="🔓 공개 - 재료 입력 기반 추천",
    description="로그인하지 않아도 재료 입력 ID로 매칭된 레시피 추천을 받을 수 있습니다."
)
def public_recommend_by_ingredient_input(
    input_id: int,
    db: Session = Depends(get_db)
):
    input_record = db.query(models.UserIngredientInput).filter(
        models.UserIngredientInput.id == input_id
    ).first()
    if not input_record:
        raise HTTPException(status_code=404, detail="Ingredient input not found")

    if not input_record.matched_food_ids:
        raise HTTPException(status_code=400, detail="No matched foods found for this input")

    recipes = db.query(models.Recipe).filter(models.Recipe.food_id.in_(input_record.matched_food_ids)).all()
    if not recipes:
        raise HTTPException(status_code=404, detail="No recipes found for matched foods")
    return recipes


# ==========================
# 🔐 로그인 유저용 추천 API (보안 강화)
# ==========================

@router.get(
    "/private/by-detection/{detection_id}",
    response_model=List[schemas.RecipeOut],
    summary="🔐 개인 - 탐지 결과 기반 추천",
    description="로그인한 사용자의 탐지 결과 ID로만 접근 가능한 안전한 레시피 추천 API입니다."
)
def private_recommend_by_detection(
    detection_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    detection = db.query(models.DetectionResult).filter(
        models.DetectionResult.id == detection_id,
        models.DetectionResult.user_id == current_user.id
    ).first()
    if not detection:
        raise HTTPException(status_code=404, detail="Detection result not found or access denied")

    recipes = db.query(models.Recipe).filter(models.Recipe.food_id == detection.food_id).all()
    if not recipes:
        raise HTTPException(status_code=404, detail="No recipes found for detected food")
    return recipes


@router.get(
    "/private/by-ingredient-ranked/{input_id}",
    response_model=List[schemas.RecipeOut],
    summary="🔐 개인 - 입력 재료 기반 추가 재료 적은 순 레시피 추천",
    description="입력한 재료로 만들 수 있는 레시피를, 추가로 필요한 재료가 적은 순서대로 추천합니다. limit 파라미터로 개수 조절 가능"
)
def private_ranked_recommendation(
    input_id: int,
    limit: int = 12,  # 👈 기본 20개 추천
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    input_record = db.query(models.UserIngredientInput).filter(
        models.UserIngredientInput.id == input_id,
        models.UserIngredientInput.user_id == current_user.id
    ).first()

    if not input_record or not input_record.matched_food_ids:
        raise HTTPException(status_code=404, detail="No matched foods for this input")

    user_ingredients = clean_input_ingredients(input_record.input_text)

    recipes = db.query(models.Recipe).filter(
        models.Recipe.food_id.in_(input_record.matched_food_ids)
    ).all()

    scored: List[tuple[int, models.Recipe]] = []
    for recipe in recipes:
        if not recipe.ingredients_cleaned:
            continue
        recipe_set = set(recipe.ingredients_cleaned)
        extra = len(recipe_set - user_ingredients)
        scored.append((extra, recipe))

    scored.sort(key=lambda x: x[0])
    return [r for _, r in scored][:limit]
