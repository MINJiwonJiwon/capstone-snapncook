# backend/routers/recipestep.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import crud, schemas, models
from backend.db import get_db

router = APIRouter(
    prefix="/recipe-steps",
    tags=["RecipeStep"]
)

@router.post(
    "/",
    response_model=schemas.RecipeStepOut,
    summary="조리 단계 추가",
    description="레시피에 대한 조리 단계를 추가합니다."
)
def create_recipe_step(step: schemas.RecipeStepCreate, db: Session = Depends(get_db)):
    return crud.create_recipe_step(db=db, step=step)

@router.get(
    "/recipe/{recipe_id}",
    response_model=List[schemas.RecipeStepOut],
    summary="레시피별 조리 단계 조회",
    description="특정 레시피 ID에 대한 모든 조리 단계를 순서대로 조회합니다."
)
def get_steps_by_recipe(recipe_id: int, db: Session = Depends(get_db)):
    steps = db.query(models.RecipeStep).filter(models.RecipeStep.recipe_id == recipe_id).order_by(models.RecipeStep.step_order.asc()).all()
    if not steps:
        raise HTTPException(status_code=404, detail="No steps found for this recipe")
    return steps
