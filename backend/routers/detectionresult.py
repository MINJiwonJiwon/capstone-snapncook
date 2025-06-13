# backend/routers/detectionresult.py

from datetime import datetime
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
    "/me",
    response_model=schemas.DetectionResultOut,
    summary="탐지 결과 저장",
    description="AI가 감지한 음식 탐지 결과를 저장합니다."
)
async def create_detection_result(
    result: schemas.DetectionResultCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 📌 음식 ID 유효성 검사
    food = db.query(models.Food).filter(models.Food.id == result.food_id).first()
    if not food:
        raise HTTPException(status_code=400, detail={
            "error_code": "FOOD_NOT_FOUND",
            "message": "해당 음식은 DB에 등록되어 있지 않습니다."
        })

    # ✅ image_path가 파일명만 있을 경우 날짜 경로 추가
    result_data = result.model_dump()
    if "/" not in result_data["image_path"]:
        today = datetime.now().strftime("%Y/%m/%d")
        result_data["image_path"] = f"{today}/{result_data['image_path']}"

    # ✅ 로그인한 사용자 ID를 삽입
    result_data["user_id"] = current_user.id

    print("🔥 최종 저장될 image_path:", result_data["image_path"])

    return crud.create_detection_result(db=db, detection=schemas.DetectionResultCreate(**result_data))

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
    return results  # ✅ raise 제거 → 빈 리스트 자동 반환됨
