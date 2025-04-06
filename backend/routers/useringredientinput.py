# backend/routers/useringredientinput.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import crud, schemas, models
from backend.db import get_db

router = APIRouter(
    prefix="/user-ingredient-inputs",
    tags=["UserIngredientInput"]
)

@router.post(
    "/",
    response_model=schemas.UserIngredientInputOut,
    summary="재료 입력 저장",
    description="사용자가 입력한 재료 목록을 저장합니다."
)
def create_user_ingredient_input(
    input_data: schemas.UserIngredientInputCreate,
    db: Session = Depends(get_db)
):
    return crud.create_user_ingredient_input(db=db, input_data=input_data)

@router.get(
    "/{input_id}",
    response_model=schemas.UserIngredientInputOut,
    summary="재료 입력 조회",
    description="재료 입력 ID를 기준으로 재료 입력 정보를 조회합니다."
)
def get_user_ingredient_input(input_id: int, db: Session = Depends(get_db)):
    input_record = db.query(models.UserIngredientInput).filter(
        models.UserIngredientInput.id == input_id
    ).first()

    if input_record is None:
        raise HTTPException(status_code=404, detail="Ingredient input not found")

    return input_record
