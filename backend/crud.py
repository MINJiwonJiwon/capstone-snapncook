# backend/crud.py
from sqlalchemy.orm import Session
from typing import Optional
from backend import models, schemas

# ---------- User ----------
def create_user(db: Session, user: schemas.UserCreateWithPassword) -> models.User:
    db_user = models.User(**user.model_dump(exclude={"password"}))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_oauth(db: Session, provider: str, oauth_id: str):
    return (
        db.query(models.User)
        .join(models.SocialAccount)
        .filter(
            models.SocialAccount.provider == provider,
            models.SocialAccount.oauth_id == oauth_id
        )
        .first()
    )

# ---------- Food ----------
def create_food(db: Session, food: schemas.FoodCreate) -> models.Food:
    db_food = models.Food(**food.model_dump())
    db.add(db_food)
    db.commit()
    db.refresh(db_food)
    return db_food

# ---------- Recipe ----------
def create_recipe(db: Session, recipe: schemas.RecipeCreate) -> models.Recipe:
    db_recipe = models.Recipe(**recipe.model_dump())
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe

# ---------- RecipeStep ----------
def create_recipe_step(db: Session, step: schemas.RecipeStepCreate) -> models.RecipeStep:
    db_step = models.RecipeStep(**step.model_dump())
    db.add(db_step)
    db.commit()
    db.refresh(db_step)
    return db_step

# ---------- DetectionResult ----------
def create_detection_result(db: Session, result: schemas.DetectionResultCreate) -> models.DetectionResult:
    db_result = models.DetectionResult(**result.model_dump())
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result

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
def create_user_ingredient_input(db: Session, input_data: schemas.UserIngredientInputCreate) -> models.UserIngredientInput:
    db_input = models.UserIngredientInput(**input_data.model_dump())
    db.add(db_input)
    db.commit()
    db.refresh(db_input)
    return db_input

# ---------- UserIngredientInputRecipe ----------
def create_user_ingredient_input_recipe(db: Session, item: schemas.UserIngredientInputRecipeCreate) -> models.UserIngredientInputRecipe:
    db_item = models.UserIngredientInputRecipe(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
