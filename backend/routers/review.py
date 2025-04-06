# backend/routers/review.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import crud, schemas, models
from backend.db import get_db

router = APIRouter(
    prefix="/reviews",
    tags=["Review"]
)

@router.post(
    "/",
    response_model=schemas.ReviewOut,
    summary="리뷰 생성",
    description="특정 음식에 대한 유저의 리뷰를 작성합니다."
)
def create_review(review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    return crud.create_review(db=db, review=review)

@router.get(
    "/food/{food_id}",
    response_model=List[schemas.ReviewOut],
    summary="음식별 리뷰 조회",
    description="특정 음식 ID에 해당하는 모든 리뷰 목록을 조회합니다."
)
def get_reviews_by_food(food_id: int, db: Session = Depends(get_db)):
    reviews = db.query(models.Review).filter(models.Review.food_id == food_id).all()
    return reviews

@router.get(
    "/user/{user_id}",
    response_model=List[schemas.ReviewOut],
    summary="유저별 리뷰 조회",
    description="특정 유저가 작성한 모든 리뷰 목록을 조회합니다."
)
def get_reviews_by_user(user_id: int, db: Session = Depends(get_db)):
    reviews = db.query(models.Review).filter(models.Review.user_id == user_id).all()
    return reviews