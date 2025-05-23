# routers/recipe.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.session import get_db
from schemas.recipe import RecipeCreate, Recipe
from crud.recipe import create_recipe, get_all_recipes
from typing import List
import json

router = APIRouter()

@router.post("/", response_model=Recipe)
def create(recipe: RecipeCreate, db: Session = Depends(get_db)):
    return create_recipe(db, recipe)

@router.get("/", response_model=List[Recipe])
def read_all(db: Session = Depends(get_db)):
    db_recipes = get_all_recipes(db)
    for r in db_recipes:
        r.ingredients = json.loads(r.ingredients or "[]")
        r.steps = json.loads(r.steps or "[]")
    return db_recipes
