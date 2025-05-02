# backend/routers/detectionresult.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import crud, schemas, models
from backend.db import get_db
from backend.app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/detection-results",
    tags=["DetectionResult"]
)

@router.post(
    "/",
    response_model=schemas.DetectionResultOut,
    summary="탐지 결과 저장",
    description="AI가 감지한 음식 탐지 결과를 현재 로그인된 유저 기준으로 저장합니다."
)
def create_detection_result(
    result: schemas.DetectionResultCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)  # ✅ 여기가 핵심
):
    result_data = result.model_dump()
    result_data["user_id"] = current_user.id  # ✅ user_id 직접 주입
    return crud.create_detection_result(db=db, result=schemas.DetectionResultCreate(**result_data))


@router.get(
    "/me",
    response_model=List[schemas.DetectionResultOut],
    summary="내 탐지 결과 조회",
    description="현재 로그인한 유저의 모든 음식 탐지 결과를 조회합니다."
)
def get_my_detection_results(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    results = db.query(models.DetectionResult).filter(
        models.DetectionResult.user_id == current_user.id
    ).all()
    if not results:
        raise HTTPException(status_code=404, detail="No detection results found for this user")
    return results
