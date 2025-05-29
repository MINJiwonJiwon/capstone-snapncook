# backend/routers/ai_detection.py

import os
from datetime import datetime
import hashlib
import aiofiles
import aiohttp
import logging
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from backend import schemas, crud, models
from backend.app.auth.dependencies import get_current_user_from_request
from backend.db import get_db
from backend.schemas import DetectedFood
from typing import List, Optional, Tuple

router = APIRouter(
    prefix="/ai-detection",
    tags=["AI Detection"]
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
AI_SERVER_URL = os.getenv("AI_SERVER_URL", "http://ai-server:8001/predict")
logger = logging.getLogger(__name__)

async def save_upload_file(file: UploadFile) -> Tuple[str, str]:
    today = datetime.now()
    subdir = os.path.join("uploads", today.strftime("%Y"), today.strftime("%m"), today.strftime("%d"))
    os.makedirs(subdir, exist_ok=True)

    safe_filename = os.path.basename(file.filename or "unnamed.jpg")
    filename = f"upload_{today.strftime('%H%M%S')}_{safe_filename}"
    filepath = os.path.join(subdir, filename)

    async with aiofiles.open(filepath, "wb") as out_file:
        content = await file.read()
        await out_file.write(content)

    await file.seek(0)
    return filename, filepath

async def calculate_hash(file: UploadFile) -> str:
    hasher = hashlib.sha256()
    content = await file.read()
    hasher.update(content)
    await file.seek(0)  # 파일 포인터 초기화
    return hasher.hexdigest()

@router.post(
    "/upload", 
    summary="이미지 업로드",
    description="사용자가 업로드한 이미지를 서버에 저장합니다. 실제 예측은 수행하지 않으며, 파일만 저장됩니다."
    )
async def upload_image(file: UploadFile = File(...)):
    filename, _ = await save_upload_file(file)  
    return {"filename": filename, "message": "업로드 성공"}

@router.post(
    "/predict",
    response_model=schemas.PredictResponse,
    summary="AI 예측 수행",
    description="사용자가 업로드한 이미지를 AI 서버에 전송하여 음식 종류를 예측하고, 결과를 DB에 저장합니다. 중복 이미지의 경우 캐시된 결과를 반환합니다. 로그인하지 않은 사용자도 사용 가능하며, 해당 경우 user_id는 None으로 처리됩니다."
)
async def predict_image(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    current_user: Optional[models.User] = None
    try:
        # Authorization 헤더 직접 확인
        token = request.headers.get("Authorization")
        current_user = None

        if token and token.startswith("Bearer"):
            try:
                current_user = await get_current_user_from_request(request)
            except Exception:
                pass  # 유효하지 않거나 만료된 토큰은 무시
    
        image_hash = await calculate_hash(file)

        # 캐시 확인
        existing = db.query(models.DetectionResult).filter(
            models.DetectionResult.image_hash == image_hash
        ).first()
        if existing:
            food = db.query(models.Food).filter(models.Food.id == existing.food_id).first()
            if not food:
                raise HTTPException(status_code=404, detail="Food not found")
            detected = [DetectedFood(name=food.name, confidence=existing.confidence, image_filename=existing.image_path, food_id=food.id )]
            return schemas.PredictResponse(filename=existing.image_path, detected=detected)

        filename, filepath = await save_upload_file(file)

        async with aiohttp.ClientSession() as session:
            form = aiohttp.FormData()
            async with aiofiles.open(filepath, "rb") as image_file:
                form.add_field("file", await image_file.read(), filename=filename, content_type=file.content_type)

            async with session.post(AI_SERVER_URL, data=form) as response:
                if response.status == 200:
                    result = await response.json()
                    detected_items: List[DetectedFood] = []
                    for item in result.get("detected", []):
                        food = crud.get_or_create_food(db, item["name"])
                        detection_data = schemas.DetectionResultCreate(
                            user_id=current_user.id if current_user else None,
                            food_id=food.id,
                            image_path=filename,
                            confidence=item["confidence"],
                            image_hash=image_hash
                        )
                        crud.create_detection_result(db, detection_data)
                        detected_items.append(schemas.DetectedFood(
                            name=item["name"],
                            confidence=item["confidence"],
                            image_filename=filename,
                            food_id=food.id  # 🔥 명시적으로 추가
                        ))

                    return schemas.PredictResponse(filename=filename, detected=detected_items)
                else:
                    error_msg = await response.text()
                    raise HTTPException(status_code=response.status, detail=f"AI 서버 오류: {error_msg}")

    except aiohttp.ClientError:
        logger.exception("AI 서버와 통신 중 오류 발생")
        raise HTTPException(status_code=502, detail="AI 서버와 통신 실패")
    except Exception as e:
        logger.exception("예측 처리 중 오류 발생")
        raise HTTPException(status_code=500, detail=str(e))

@router.get(
    "/results", 
    response_model=list[schemas.DetectionResultOut],
    summary="전체 감지 결과 조회",
    description="DB에 저장된 모든 음식 감지 결과를 조회합니다."    
)
def get_results(db: Session = Depends(get_db)):
    return db.query(models.DetectionResult).all()
