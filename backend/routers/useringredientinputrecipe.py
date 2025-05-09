# backend/routers/useringredientinputrecipe.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import crud, schemas, models
from backend.db import get_db
from backend.app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/user-ingredient-input-recipes",
    tags=["UserIngredientInputRecipe"]
)

# ✅ 추천 매핑 저장 - 본인 input_id만 허용
@router.post(
    "/",
    response_model=schemas.UserIngredientInputRecipeOut,
    summary="추천 레시피 매핑 생성",
    description="재료 입력에 대한 추천 레시피 매핑을 저장합니다. 로그인한 사용자 본인의 input_id만 허용됩니다."
)
def create_user_ingredient_input_recipe(
    input_recipe: schemas.UserIngredientInputRecipeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 입력한 input_id가 현재 유저의 것인지 확인
    input_record = db.query(models.UserIngredientInput).filter(
        models.UserIngredientInput.id == input_recipe.input_id,
        models.UserIngredientInput.user_id == current_user.id
    ).first()

    if not input_record:
        raise HTTPException(status_code=403, detail="Cannot map recipe to another user's input")

    return crud.create_user_ingredient_input_recipe(db=db, item=input_recipe)

# ✅ 추천 매핑 조회 - 본인 input_id만 허용
@router.get(
    "/input/{input_id}",
    response_model=List[schemas.UserIngredientInputRecipeOut],
    summary="입력 ID로 추천 레시피 목록 조회",
    description="특정 재료 입력(input_id)에 대해 추천된 레시피 목록을 조회합니다. 로그인한 사용자 본인의 input만 조회할 수 있습니다."
)
def get_recipes_by_input_id(
    input_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # input_id가 현재 유저의 것인지 확인
    input_record = db.query(models.UserIngredientInput).filter(
        models.UserIngredientInput.id == input_id,
        models.UserIngredientInput.user_id == current_user.id
    ).first()

    if not input_record:
        raise HTTPException(status_code=403, detail="Cannot view recipes for another user's input")

    results = db.query(models.UserIngredientInputRecipe).filter(
        models.UserIngredientInputRecipe.input_id == input_id
    ).order_by(models.UserIngredientInputRecipe.rank.asc()).all()

    if not results:
        raise HTTPException(status_code=404, detail="No recommended recipes found for given input_id")

    return results
