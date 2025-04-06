# backend/routers/detectionresult.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import crud, schemas, models
from backend.db import get_db

router = APIRouter(
    prefix="/detection-results",
    tags=["DetectionResult"]
)

@router.post(
    "/",
    response_model=schemas.DetectionResultOut,
    summary="탐지 결과 저장",
    description="AI가 감지한 음식 탐지 결과를 저장합니다."
)
def create_detection_result(result: schemas.DetectionResultCreate, db: Session = Depends(get_db)):
    return crud.create_detection_result(db=db, result=result)

@router.post(
    "/user/{user_id}",
    response_model=schemas.DetectionResultOut,
    summary="특정 유저의 탐지 결과 저장",
    description="특정 유저의 음식 탐지 결과를 저장합니다."
)
def create_detection_result_for_user(user_id: int, result: schemas.DetectionResultCreate, db: Session = Depends(get_db)):
    # user_id와 함께 탐지 결과를 저장하는 로직을 추가합니다.
    result.user_id = user_id  # 결과에 user_id를 추가
    return crud.create_detection_result(db=db, result=result)

@router.get(
    "/user/{user_id}",
    response_model=List[schemas.DetectionResultOut],
    summary="유저의 탐지 결과 조회",
    description="특정 유저의 모든 음식 탐지 결과를 조회합니다."
)
def get_detection_results(user_id: int, db: Session = Depends(get_db)):
    results = db.query(models.DetectionResult).filter(models.DetectionResult.user_id == user_id).all()
    if not results:
        raise HTTPException(status_code=404, detail="No detection results found for this user")
    return results
