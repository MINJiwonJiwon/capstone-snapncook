# backend/routers/useringredientinput.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend import crud, schemas, models
from backend.app.services.matching import auto_match_foods_from_input
from backend.db import get_db
from backend.app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/user-ingredient-inputs",
    tags=["UserIngredientInput"]
)

# ✅ 재료 입력 저장 (user_id는 current_user 기준 + 자동 음식 매칭 포함)
@router.post(
    "/",
    response_model=schemas.UserIngredientInputOut,
    summary="재료 입력 저장",
    description="로그인한 사용자가 입력한 재료 목록을 저장합니다."
)
def create_user_ingredient_input(
    input_data: schemas.UserIngredientInputCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    matched_ids = auto_match_foods_from_input(input_data.input_text, db)

    new_input = models.UserIngredientInput(
        user_id=current_user.id,
        input_text=input_data.input_text,
        matched_food_ids=matched_ids
    )
    return crud.create_user_ingredient_input(db=db, input_obj=new_input)



# ✅ 재료 입력 단건 조회 (내 것만 조회 가능)
@router.get(
    "/{input_id}",
    response_model=schemas.UserIngredientInputOut,
    summary="재료 입력 조회",
    description="로그인한 사용자의 입력 ID 기준으로 재료 입력 정보를 조회합니다."
)
def get_user_ingredient_input(
    input_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    input_record = db.query(models.UserIngredientInput).filter(
        models.UserIngredientInput.id == input_id,
        models.UserIngredientInput.user_id == current_user.id
    ).first()

    if input_record is None:
        raise HTTPException(status_code=404, detail="Ingredient input not found or access denied")

    return input_record
