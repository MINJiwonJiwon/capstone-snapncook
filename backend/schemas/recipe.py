# schemas/recipe.py
from pydantic import BaseModel
from typing import List, Optional

class RecipeBase(BaseModel):
    name: str
    summary: Optional[str] = None
    ingredients: Optional[List[str]] = None
    steps: Optional[List[str]] = None
    image_url: Optional[str] = None
    tags: Optional[str] = None

class RecipeCreate(RecipeBase):
    pass

class Recipe(RecipeBase):
    id: int

    class Config:
        orm_mode = True
