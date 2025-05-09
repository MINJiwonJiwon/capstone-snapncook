# backend/routers/recipe.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import crud, schemas, models
from backend.db import get_db

router = APIRouter(
    prefix="/recipes",
    tags=["Recipe"]
)

# 레시피 생성
@router.post(
    "/",
    response_model=schemas.RecipeOut,
    summary="레시피 생성",
    description="음식에 대한 레시피 정보를 생성합니다."
)
def create_recipe(recipe: schemas.RecipeCreate, db: Session = Depends(get_db)):
    return crud.create_recipe(db=db, recipe=recipe)

# 모든 레시피 조회
@router.get(
    "/",
    response_model=List[schemas.RecipeOut],
    summary="모든 레시피 조회",
    description="등록된 모든 레시피 정보를 조회합니다."
)
def get_all_recipes(db: Session = Depends(get_db)):
    return db.query(models.Recipe).all()

# 레시피 단건 조회
@router.get(
    "/{recipe_id}",
    response_model=schemas.RecipeOut,
    summary="레시피 단건 조회",
    description="특정 레시피 ID로 레시피 정보를 조회합니다."
)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe

# 음식 ID로 레시피 리스트 조회
@router.get(
    "/food/{food_id}",
    response_model=List[schemas.RecipeOut],
    summary="특정 음식 ID로 레시피 리스트 조회",
    description="특정 음식(food_id)에 대한 모든 레시피를 조회합니다."
)
def get_recipes_by_food(food_id: int, db: Session = Depends(get_db)):
    recipes = db.query(models.Recipe).filter(models.Recipe.food_id == food_id).all()
    if not recipes:
        raise HTTPException(status_code=404, detail="No recipes found for this food")
    return recipes

# 레시피 상세 통합 조회 (음식 + 레시피 요약 + 조리 단계)
@router.get(
    "/{recipe_id}/detail",
    response_model=schemas.RecipeDetailResponse,
    summary="레시피 상세 통합 조회",
    description="특정 레시피 ID로 음식 정보, 레시피 요약, 단계별 설명을 한 번에 조회합니다."
)
def get_recipe_detail(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    food = db.query(models.Food).filter(models.Food.id == recipe.food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")

    steps = db.query(models.RecipeStep).filter(models.RecipeStep.recipe_id == recipe_id).order_by(models.RecipeStep.step_order.asc()).all()

    return schemas.RecipeDetailResponse(
        food=schemas.FoodSummary(
            id=food.id,
            name=food.name,
            description=food.description,
            image_url=food.image_url
        ),
        recipe=schemas.RecipeSummary(
            id=recipe.id,
            title=recipe.title,
            ingredients=recipe.ingredients,
            instructions=recipe.instructions
        ),
        steps=[
            schemas.RecipeStepSummary(
                step_order=step.step_order,
                description=step.description,
                image_url=step.image_url
            ) for step in steps
        ]
    )
