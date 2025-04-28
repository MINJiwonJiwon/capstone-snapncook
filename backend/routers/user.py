# backend/routers/user.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend import crud, models, schemas
from backend.db import get_db
from backend.app.auth.dependencies import get_current_user

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
def create_user(user: schemas.UserCreateWithPassword, db: Session = Depends(get_db)):
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

@router.patch(
    "/me",
    response_model=schemas.UserOut,
    summary="프로필 수정 (닉네임/프로필 이미지)",
    description="현재 로그인한 사용자의 닉네임과 프로필 이미지를 수정합니다."
)
def update_profile(
    profile_update: schemas.UserUpdateProfile,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if profile_update.nickname is not None:
        user.nickname = profile_update.nickname
    if profile_update.profile_image_url is not None:
        user.profile_image_url = profile_update.profile_image_url

    db.commit()
    db.refresh(user)

    return user
