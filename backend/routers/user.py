# backend/routers/user.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend import crud, models, schemas
from backend.db import get_db

router = APIRouter(
    prefix="/users",
    tags=["User"]
)

@router.post(
    "/", 
    response_model=schemas.UserOut, 
    summary="Create a new user", 
    description="사용자로부터 입력받은 정보를 기반으로 새로운 유저를 생성합니다. 생성된 유저의 정보를 반환합니다."
)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db=db, user=user)

@router.get(
    "/{user_id}", 
    response_model=schemas.UserOut, 
    summary="Get user by ID", 
    description="지정한 user_id를 통해 해당 유저 정보를 조회합니다. 유저가 존재하지 않으면 404 에러를 반환합니다."
)
def get_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.get(
    "/", 
    response_model=List[schemas.UserOut], 
    summary="전체 유저 목록 조회", 
    description="DB에 저장된 전체 유저 리스트를 반환합니다."
)
def get_all_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()
