# backend/routers/review.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import crud, schemas, models
from backend.app.auth.dependencies import get_current_user
from backend.db import get_db

router = APIRouter(
    prefix="/reviews",
    tags=["Review"]
)

# ✅ 리뷰 생성 (user_id는 current_user 기준)
@router.post(
    "/",
    response_model=schemas.ReviewOut,
    summary="리뷰 생성",
    description="특정 음식에 대한 유저의 리뷰를 작성합니다. 로그인된 사용자 기준으로 저장됩니다."
)
def create_review(
    review: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    review_data = review.model_dump()
    review_data["user_id"] = current_user.id
    return crud.create_review(db=db, review=schemas.ReviewCreate(**review_data))


# ✅ 음식별 리뷰 조회 (공개)
@router.get(
    "/food/{food_id}",
    response_model=List[schemas.ReviewOut],
    summary="음식별 리뷰 조회",
    description="특정 음식 ID에 해당하는 모든 리뷰 목록을 조회합니다."
)
def get_reviews_by_food(food_id: int, db: Session = Depends(get_db)):
    return db.query(models.Review).filter(models.Review.food_id == food_id).all()


# ✅ 개인 리뷰 조회 (기존 /user/{user_id} → /me 로 대체)
@router.get(
    "/me",
    response_model=List[schemas.ReviewOut],
    summary="내가 작성한 리뷰 조회",
    description="로그인한 사용자가 작성한 리뷰 목록을 조회합니다."
)
def get_my_reviews(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Review).filter(models.Review.user_id == current_user.id).all()


# 리뷰 수정
@router.patch("/{review_id}", response_model=schemas.ReviewOut)
def update_review(
    review_id: int,
    update_data: schemas.ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied")

    if update_data.content is not None:
        review.content = update_data.content
    if update_data.rating is not None:
        review.rating = update_data.rating

    db.commit()
    db.refresh(review)
    return review


# 리뷰 삭제
@router.delete("/{review_id}", status_code=204)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied")

    db.delete(review)
    db.commit()
    return
