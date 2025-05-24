# backend/routers/userlog.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import schemas, models
from backend.db import get_db
from backend.app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/user-logs",
    tags=["UserLog"]
)

# ✅ 로그 생성 - user_id는 current_user 기준으로 주입
@router.post("/", response_model=schemas.UserLogOut)
def create_user_log(
    log: schemas.UserLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_log = models.UserLog(
        user_id=current_user.id,
        action=log.action,
        target_id=log.target_id,
        target_type=log.target_type,
        meta=log.meta
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


# ✅ 내 로그 조회 - user_id는 current_user 기준으로 조회
@router.get("/me", response_model=List[schemas.UserLogOut])
def get_my_logs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    logs = db.query(models.UserLog).filter(models.UserLog.user_id == current_user.id).all()
    if not logs:
        raise HTTPException(status_code=404, detail="No logs found for this user")
    return logs

# ✅ 특정 user_id의 로그 조회 (관리자용 또는 테스트용)
@router.get("/user/{user_id}", response_model=List[schemas.UserLogOut])
def get_logs_by_user_id(
    user_id: int,
    db: Session = Depends(get_db),
):
    logs = db.query(models.UserLog).filter(models.UserLog.user_id == user_id).all()
    if not logs:
        raise HTTPException(status_code=404, detail="No logs found for this user")
    return logs
