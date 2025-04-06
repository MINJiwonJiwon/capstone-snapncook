# backend/routers/useringredientinputrecipe.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import crud, schemas, models
from backend.db import get_db

router = APIRouter(
    prefix="/user-ingredient-input-recipes",
    tags=["UserIngredientInputRecipe"]
)

@router.post(
    "/",
    response_model=schemas.UserIngredientInputRecipeOut,
    summary="추천 레시피 매핑 생성",
    description="재료 입력에 대한 추천 레시피 매핑을 저장합니다."
)
def create_user_ingredient_input_recipe(
    input_recipe: schemas.UserIngredientInputRecipeCreate,
    db: Session = Depends(get_db)
):
    return crud.create_user_ingredient_input_recipe(db=db, item=input_recipe)

@router.get(
    "/input/{input_id}",
    response_model=List[schemas.UserIngredientInputRecipeOut],
    summary="입력 ID로 추천 레시피 목록 조회",
    description="특정 재료 입력(input_id)에 대해 추천된 레시피 목록을 조회합니다."
)
def get_recipes_by_input_id(input_id: int, db: Session = Depends(get_db)):
    results = db.query(models.UserIngredientInputRecipe).filter(
        models.UserIngredientInputRecipe.input_id == input_id
    ).order_by(models.UserIngredientInputRecipe.rank.asc()).all()

    if not results:
        raise HTTPException(status_code=404, detail="No recommended recipes found for given input_id")

    return results
