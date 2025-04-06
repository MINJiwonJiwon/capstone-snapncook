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

@router.post(
    "/",
    response_model=schemas.RecipeOut,
    summary="레시피 생성",
    description="음식에 대한 레시피 정보를 생성합니다."
)
def create_recipe(recipe: schemas.RecipeCreate, db: Session = Depends(get_db)):
    return crud.create_recipe(db=db, recipe=recipe)

@router.get(
    "/",
    response_model=List[schemas.RecipeOut],
    summary="모든 레시피 조회",
    description="등록된 모든 레시피 정보를 조회합니다."
)
def get_all_recipes(db: Session = Depends(get_db)):
    return db.query(models.Recipe).all()

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
