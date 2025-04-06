# backend/routers/userlog.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import crud, schemas, models
from backend.db import get_db

router = APIRouter(
    prefix="/user-logs",
    tags=["UserLog"]
)

@router.post(
    "/",
    response_model=schemas.UserLogOut,
    summary="유저 로그 생성",
    description="유저의 특정 행동 로그를 기록합니다."
)
def create_user_log(log: schemas.UserLogCreate, db: Session = Depends(get_db)):
    return crud.create_user_log(db=db, log=log)

@router.get(
    "/user/{user_id}",
    response_model=List[schemas.UserLogOut],
    summary="유저 로그 조회",
    description="특정 유저의 모든 행동 로그를 조회합니다."
)
def get_user_logs(user_id: int, db: Session = Depends(get_db)):
    logs = db.query(models.UserLog).filter(models.UserLog.user_id == user_id).all()
    if not logs:
        raise HTTPException(status_code=404, detail="No logs found for this user")
    return logs
