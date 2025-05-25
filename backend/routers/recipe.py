# routers/recipe.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from schemas.recipe import RecipeCreate, Recipe
from crud import recipe as crud_recipe
from db.database import get_db  # DB 세션 의존성 주입 함수

router = APIRouter(
    prefix="/recipes",
    tags=["recipes"]
)

@router.post("/", response_model=Recipe, status_code=status.HTTP_201_CREATED)
def create_recipe(recipe: RecipeCreate, db: Session = Depends(get_db)):
    db_recipe = crud_recipe.create_recipe(db, recipe)
    return db_recipe

@router.get("/", response_model=List[Recipe])
def read_all_recipes(db: Session = Depends(get_db)):
    recipes = crud_recipe.get_all_recipes(db)
    return recipes
