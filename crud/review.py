# crud/review.py

from sqlalchemy.orm import Session
from models.review import RecipeReview
from schemas.review import ReviewCreate

def create_review(db: Session, recipe_id: int, review: ReviewCreate):
    db_review = RecipeReview(**review.dict(), recipe_id=recipe_id)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_reviews_by_recipe(db: Session, recipe_id: int):
    return db.query(RecipeReview).filter(RecipeReview.recipe_id == recipe_id).all()
