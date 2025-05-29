# backend/routers/detectionresult.py

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from backend import crud, schemas, models
from backend.db import get_db
from backend.app.auth.dependencies import get_current_user, get_current_user_from_request

router = APIRouter(
    prefix="/detection-results",
    tags=["DetectionResult"]
)

@router.post(
    "/",
    response_model=schemas.DetectionResultOut,
    summary="탐지 결과 저장",
    description="AI가 감지한 음식 탐지 결과를 저장합니다. 로그인하지 않아도 사용 가능합니다."
)
async def create_detection_result(
    request: Request,
    result: schemas.DetectionResultCreate,
    db: Session = Depends(get_db),
):
    try:
        token = request.headers.get("Authorization")
        current_user = await get_current_user_from_request(request) if token and token.startswith("Bearer") else None
    except:
        current_user = None

    food = db.query(models.Food).filter(models.Food.id == result.food_id).first()
    if not food:
        raise HTTPException(status_code=400, detail={
            "error_code": "FOOD_NOT_FOUND",
            "message": "해당 음식은 DB에 등록되어 있지 않습니다."
        })

    result_data = result.model_dump()
    result_data["user_id"] = current_user.id if current_user else None
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
    return results  # ✅ raise 제거 → 빈 리스트 자동 반환됨
