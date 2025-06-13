# backend/crud.py

from datetime import date
from typing import Optional, Dict, List
from sqlalchemy import func
from sqlalchemy.orm import Session
from backend import models, schemas

# ---------- User ----------
def create_user(db: Session, user: schemas.UserCreateWithPassword) -> models.User:
    db_user = models.User(**user.model_dump(exclude={"password", "password_check"}))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_oauth(db: Session, provider: str, oauth_id: str) -> Optional[models.User]:
    return (
        db.query(models.User)
        .join(models.SocialAccount)
        .filter(
            models.SocialAccount.provider == provider,
            models.SocialAccount.oauth_id == oauth_id
        )
        .first()
    )

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_id(db: Session, user_id: int) -> models.User | None:
    return db.query(models.User).filter(models.User.id == user_id).first()

# ---------- Food ----------
def create_food(db: Session, food: schemas.FoodCreate) -> models.Food:
    db_food = models.Food(**food.model_dump())
    db.add(db_food)
    db.commit()
    db.refresh(db_food)
    return db_food

def get_or_create_food(db: Session, name: str) -> models.Food:
    food = db.query(models.Food).filter(models.Food.name == name).first()
    if food:
        return food
    return create_food(db, schemas.FoodCreate(name=name))

# ---------- Recipe ----------
def create_recipe(db: Session, recipe: schemas.RecipeCreate) -> models.Recipe:
    db_recipe = models.Recipe(**recipe.model_dump())
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe

def get_or_create_recipe(db: Session, recipe: schemas.RecipeCreate) -> models.Recipe:
    existing = db.query(models.Recipe).filter(
        models.Recipe.food_id == recipe.food_id,
        models.Recipe.title == recipe.title
    ).first()
    if existing:
        return existing
    return create_recipe(db, recipe)

def get_all_recipes(db: Session) -> List[models.Recipe]:
    return db.query(models.Recipe).all()

# ---------- RecipeStep ----------
def create_recipe_step(db: Session, step: schemas.RecipeStepCreate) -> models.RecipeStep:
    db_step = models.RecipeStep(**step.model_dump())
    db.add(db_step)
    db.commit()
    db.refresh(db_step)
    return db_step

# ---------- DetectionResult ----------
def create_detection_result(db: Session, detection: schemas.DetectionResultCreate):
    exists = db.query(models.DetectionResult).filter_by(
        image_hash=detection.image_hash,
        user_id=detection.user_id,
        food_id=detection.food_id,
        image_path=detection.image_path
    ).first()
    if exists:
        return exists  # 이미 존재하면 새로 만들지 않음

    db_obj = models.DetectionResult(**detection.dict())  # type: ignore
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

# ---------- Review ----------
def create_review(db: Session, review: schemas.ReviewCreate) -> models.Review:
    db_review = models.Review(**review.model_dump())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

# ---------- UserLog ----------
def create_user_log(db: Session, log: schemas.UserLogCreate) -> models.UserLog:
    db_log = models.UserLog(**log.model_dump())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

# ---------- UserIngredientInput ----------
def create_user_ingredient_input(db: Session, input_obj: models.UserIngredientInput) -> models.UserIngredientInput:
    db.add(input_obj)
    db.commit()
    db.refresh(input_obj)
    return input_obj

# ---------- UserIngredientInputRecipe ----------
def create_user_ingredient_input_recipe(db: Session, item: schemas.UserIngredientInputRecipeCreate) -> models.UserIngredientInputRecipe:
    db_item = models.UserIngredientInputRecipe(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# ---------- Home ----------
def get_search_rankings(db: Session, period: str, on_date: date, limit: int = 3) -> List[models.SearchRanking]:
    return (
        db.query(models.SearchRanking)
        .filter(models.SearchRanking.period == period, models.SearchRanking.base_date == on_date)
        .order_by(models.SearchRanking.rank.asc())
        .limit(limit)
        .all()
    )

def get_previous_rankings_dict(db: Session, period: str, on_date: date) -> Dict[str, int]:
    previous = (
        db.query(models.SearchRanking)
        .filter(models.SearchRanking.period == period, models.SearchRanking.base_date == on_date)
        .all()
    )
    return {r.keyword: r.rank for r in previous}

def get_random_food(db: Session) -> Optional[models.Food]:
    return db.query(models.Food).order_by(func.random()).first()

def get_average_rating_for_food(db: Session, food_id: int) -> float:
    avg = db.query(func.avg(models.Review.rating)).filter(models.Review.food_id == food_id).scalar()
    return round(avg or 0, 2)
