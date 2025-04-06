# backend/routers/food.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import crud, schemas, models
from backend.db import get_db

router = APIRouter(
    prefix="/foods",
    tags=["Food"]
)

@router.post(
    "/",
    response_model=schemas.FoodOut,
    summary="음식 생성",
    description="새로운 음식 정보를 생성합니다."
)
def create_food(food: schemas.FoodCreate, db: Session = Depends(get_db)):
    return crud.create_food(db=db, food=food)

@router.get(
    "/",
    response_model=List[schemas.FoodOut],
    summary="모든 음식 조회",
    description="등록된 모든 음식 목록을 조회합니다."
)
def get_all_foods(db: Session = Depends(get_db)):
    return db.query(models.Food).all()

@router.get(
    "/{food_id}",
    response_model=schemas.FoodOut,
    summary="음식 단건 조회",
    description="특정 음식 ID로 음식 정보를 조회합니다."
)
def get_food(food_id: int, db: Session = Depends(get_db)):
    food = db.query(models.Food).filter(models.Food.id == food_id).first()
    if food is None:
        raise HTTPException(status_code=404, detail="Food not found")
    return food
