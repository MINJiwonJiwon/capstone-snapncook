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

def calculate_hash_from_content(content: bytes) -> str:
    hasher = hashlib.sha256()
    hasher.update(content)
    return hasher.hexdigest()

async def save_upload_file_with_content(file: UploadFile, content: bytes) -> Tuple[str, str]:
    today = datetime.now()
    subdir = os.path.join("uploads", today.strftime("%Y"), today.strftime("%m"), today.strftime("%d"))
    os.makedirs(subdir, exist_ok=True)

    safe_filename = os.path.basename(file.filename or "unnamed.jpg")
    filename = f"upload_{today.strftime('%H%M%S')}_{safe_filename}"
    filepath = os.path.join(subdir, filename)

    print("📁 실제 저장 경로:", filepath)

    async with aiofiles.open(filepath, "wb") as out_file:
        await out_file.write(content)

    # ✅ 저장 후 파일 존재 여부 확인 로그
    print("📦 저장 완료 여부 체크:", os.path.exists(filepath))

    image_path = f"{today.strftime('%Y')}/{today.strftime('%m')}/{today.strftime('%d')}/{filename}"
    return image_path, filepath

async def save_upload_file(file: UploadFile) -> Tuple[str, str]:
    print("💥 파일 저장 진입")
    today = datetime.now()
    subdir = os.path.join("uploads", today.strftime("%Y"), today.strftime("%m"), today.strftime("%d"))
    os.makedirs(subdir, exist_ok=True)

    safe_filename = os.path.basename(file.filename or "unnamed.jpg")
    filename = f"upload_{today.strftime('%H%M%S')}_{safe_filename}"
    filepath = os.path.join(subdir, filename)

    print("📂 현재 작업 디렉토리:", os.getcwd())
    print("🔥 저장할 전체 경로:", os.path.abspath(filepath))

    try:
        content = await file.read()
        print("📦 읽은 파일 크기:", len(content))

        async with aiofiles.open(filepath, "wb") as out_file:
            await out_file.write(content)
            print("✅ 파일 저장 완료")

        await file.seek(0)

    except Exception as e:
        print("❌ 파일 저장 중 오류:", str(e))

    image_path = f"{today.strftime('%Y')}/{today.strftime('%m')}/{today.strftime('%d')}/{filename}"
    print("🧾 최종 image_path:", image_path)

    return image_path, filepath

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
        print("📨 AI 예측 진입, 파일 해시 확인 전")

        # 🔐 Authorization 헤더에서 사용자 정보 추출
        token = request.headers.get("Authorization")
        if token and token.startswith("Bearer"):
            try:
                current_user = await get_current_user_from_request(request)
            except Exception:
                pass  # 유효하지 않은 토큰은 무시

        # 📦 파일 내용 읽기 및 해시 계산
        content = await file.read()
        await file.seek(0)
        image_hash = calculate_hash_from_content(content)

        # 🧠 캐시 확인
        existing = db.query(models.DetectionResult).filter(
            models.DetectionResult.image_hash == image_hash
        ).first()

        if existing and existing.user_id == (current_user.id if current_user else None):
            food = db.query(models.Food).filter(models.Food.id == existing.food_id).first()
            if not food:
                raise HTTPException(status_code=404, detail="Food not found")
            detected = [DetectedFood(
                name=food.name,
                confidence=existing.confidence,
                image_filename=existing.image_path,
                food_id=food.id,
                id=existing.id  # ✅ 여기서 기존 감지결과 id 전달 # type: ignore
            )]
            print("📦 캐시된 결과 존재, DB에서 결과 반환")
            return schemas.PredictResponse(filename=existing.image_path, detected=detected)


        # 🗃️ 중복 없으면 파일 저장
        image_path, filepath = await save_upload_file_with_content(file, content)
        print("🔥 최종 저장될 image_path:", image_path)

        # 🤖 AI 서버에 이미지 전송
        async with aiohttp.ClientSession() as session:
            form = aiohttp.FormData()
            async with aiofiles.open(filepath, "rb") as image_file:
                form.add_field(
                    "file", await image_file.read(),
                    filename=os.path.basename(image_path),
                    content_type=file.content_type
                )

            async with session.post(AI_SERVER_URL, data=form) as response:
                if response.status == 200:
                    result = await response.json()
                    detected_items: List[DetectedFood] = []
                    for item in result.get("detected", []):
                        food = crud.get_or_create_food(db, item["name"])
                        detection_data = schemas.DetectionResultCreate(
                            user_id=current_user.id if current_user else None,
                            food_id=food.id,
                            image_path=image_path,
                            confidence=item["confidence"],
                            image_hash=image_hash
                        )
                        created_result = crud.create_detection_result(db, detection_data)
                        detected_items.append(schemas.DetectedFood(
                            name=item["name"],
                            confidence=item["confidence"],
                            image_filename=image_path,
                            food_id=food.id,
                            id=created_result.id  # ✅ 이게 실제 DB id # type: ignore
                        ))
                    return schemas.PredictResponse(filename=image_path, detected=detected_items)
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
