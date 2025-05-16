# routers/review.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db
from schemas.review import ReviewCreate, Review
from crud import review as crud_review
from typing import List

router = APIRouter(prefix="/recipes", tags=["Recipe Review"])

@router.post("/{recipe_id}/reviews", response_model=Review)
def write_review(recipe_id: int, review: ReviewCreate, db: Session = Depends(get_db)):
    return crud_review.create_review(db, recipe_id, review)

@router.get("/{recipe_id}/reviews", response_model=List[Review])
def get_reviews(recipe_id: int, db: Session = Depends(get_db)):
    return crud_review.get_reviews_by_recipe(db, recipe_id)
