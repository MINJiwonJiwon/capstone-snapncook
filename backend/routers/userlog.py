# backend/routers/userlog.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import crud, schemas, models
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
    log_data = log.model_dump()
    log_data["user_id"] = current_user.id
    return crud.create_user_log(db=db, log=schemas.UserLogCreate(**log_data))


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
