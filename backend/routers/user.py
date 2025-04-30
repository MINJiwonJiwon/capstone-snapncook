# backend/routers/user.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from backend import crud, models, schemas
from backend.app.auth.utils import hash_password, verify_password
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

@router.delete(
    "/me",
    summary="회원 탈퇴 (Delete my account)",
    description="현재 로그인한 사용자의 계정과 관련된 모든 Refresh Token을 삭제합니다."
)
def delete_current_user(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. 해당 유저의 Refresh Token 삭제
    db.query(models.RefreshToken).filter(models.RefreshToken.user_id == current_user.id).delete()

    # 2. 해당 유저 삭제
    db.delete(current_user)

    # 3. 커밋
    db.commit()

    # 4. 응답 반환
    return Response(status_code=204)

@router.patch(
    "/me/password",
    summary="비밀번호 변경",
    description="현재 로그인한 사용자가 본인의 비밀번호를 변경합니다."
)
def change_password(
    password_update: schemas.UserUpdatePassword,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not verify_password(password_update.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="현재 비밀번호가 일치하지 않습니다.")

    new_password_hash = hash_password(password_update.new_password)
    current_user.password_hash = new_password_hash

    db.commit()

    return {"message": "Password updated successfully"}

@router.get(
    "/me/social",
    summary="소셜 연동 상태 확인",
    description="현재 로그인한 유저가 연동된 소셜 계정의 provider와 ID를 반환합니다."
)
def get_social_status(
    current_user: models.User = Depends(get_current_user)
):
    return {
        "oauth_provider": current_user.oauth_provider,
        "oauth_id": current_user.oauth_id
    }

@router.delete(
    "/me/social/{provider}",
    summary="소셜 연동 해제",
    description="현재 로그인한 유저가 연동된 소셜 계정을 해제합니다."
)
def disconnect_social_account(
    provider: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.oauth_provider != provider:
        raise HTTPException(status_code=400, detail="No such social provider connected")

    current_user.oauth_provider = None
    current_user.oauth_id = None
    db.commit()
    db.refresh(current_user)

    return {"message": f"{provider} 연동이 해제되었습니다."}
