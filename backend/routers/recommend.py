# backend/routers/recommend.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import models, schemas
from backend.db import get_db

router = APIRouter(
    prefix="/recommend",
    tags=["Recommendation"]
)

# 1. 음식 ID로 레시피 추천
@router.get(
    "/recipes/food/{food_id}",
    response_model=List[schemas.RecipeOut],
    summary="음식 ID로 레시피 추천",
    description="특정 음식(food_id)에 대해 등록된 레시피들을 추천합니다."
)
def recommend_recipes_by_food(food_id: int, db: Session = Depends(get_db)):
    recipes = db.query(models.Recipe).filter(models.Recipe.food_id == food_id).all()
    if not recipes:
        raise HTTPException(status_code=404, detail="No recipes found for this food")
    return recipes

# 2. 탐지 결과 ID로 레시피 추천
@router.get(
    "/recipes/by-detection/{detection_id}",
    response_model=List[schemas.RecipeOut],
    summary="탐지 결과 ID로 레시피 추천",
    description="AI가 감지한 탐지 결과(detection_id)를 기반으로 레시피를 추천합니다."
)
def recommend_recipes_by_detection(detection_id: int, db: Session = Depends(get_db)):
    detection = db.query(models.DetectionResult).filter(models.DetectionResult.id == detection_id).first()
    if not detection:
        raise HTTPException(status_code=404, detail="Detection result not found")
    recipes = db.query(models.Recipe).filter(models.Recipe.food_id == detection.food_id).all()
    if not recipes:
        raise HTTPException(status_code=404, detail="No recipes found for detected food")
    return recipes

# 3. 재료 입력 ID로 레시피 추천
@router.get(
    "/recipes/by-ingredient/{input_id}",
    response_model=List[schemas.RecipeOut],
    summary="재료 입력 ID로 레시피 추천",
    description="사용자가 입력한 재료(input_id)를 기반으로 매칭된 음식들의 레시피를 추천합니다."
)
def recommend_recipes_by_ingredient_input(input_id: int, db: Session = Depends(get_db)):
    input_record = db.query(models.UserIngredientInput).filter(models.UserIngredientInput.id == input_id).first()
    if not input_record:
        raise HTTPException(status_code=404, detail="Ingredient input not found")
    
    if not input_record.matched_food_ids:
        raise HTTPException(status_code=400, detail="No matched foods found for this input")

    recipes = db.query(models.Recipe).filter(models.Recipe.food_id.in_(input_record.matched_food_ids)).all()
    if not recipes:
        raise HTTPException(status_code=404, detail="No recipes found for matched foods")
    return recipes
