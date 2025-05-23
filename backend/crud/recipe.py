# crud/recipe.py
from sqlalchemy.orm import Session
from models.recipe import Recipe
from schemas.recipe import RecipeCreate

import json

def create_recipe(db: Session, recipe: RecipeCreate):
    db_recipe = Recipe(
        name=recipe.name,
        summary=recipe.summary,
        ingredients=json.dumps(recipe.ingredients),
        steps=json.dumps(recipe.steps),
        image_url=recipe.image_url,
        tags=recipe.tags
    )
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe

def get_all_recipes(db: Session):
    return db.query(Recipe).all()
