# routers/food.py

from fastapi import APIRouter, UploadFile, File, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List
import aiohttp
import aiofiles
import os
from datetime import datetime
import logging

from db.session import get_db
from schemas.food import FoodDetectionBase, FoodDetection as DetectionResult, PredictResponse
from crud import food as crud_food

router = APIRouter(prefix="/food", tags=["Food Detection"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
AI_SERVER_URL = os.getenv("AI_SERVER_URL", "http://localhost:8001/predict")

logger = logging.getLogger(__name__)

async def save_upload_file(file: UploadFile, upload_dir: str) -> tuple[str, str]:
    safe_filename = os.path.basename(file.filename)
    filename = f"upload_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{safe_filename}"
    filepath = os.path.join(upload_dir, filename)
    async with aiofiles.open(filepath, "wb") as out_file:
        content = await file.read()
        await out_file.write(content)
    return filename, filepath

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    filename, _ = await save_upload_file(file, UPLOAD_DIR)
    return {"filename": filename, "message": "업로드 성공"}

@router.post("/predict", response_model=PredictResponse)
async def predict_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        filename, filepath = await save_upload_file(file, UPLOAD_DIR)

        async with aiohttp.ClientSession() as session:
            form = aiohttp.FormData()
            async with aiofiles.open(filepath, "rb") as image_file:
                form.add_field("file", await image_file.read(), filename=filename, content_type=file.content_type)

            async with session.post(AI_SERVER_URL, data=form) as response:
                if response.status == 200:
                    result = await response.json()

                    detected_items = []
                    for item in result.get("detected", []):
                        detection_data = FoodDetectionBase(
                            name=item["name"],
                            confidence=item["confidence"],
                            image_filename=filename
                        )
                        crud_food.create_food_detection(db, detection_data)
                        detected_items.append(detection_data)

                    return PredictResponse(filename=filename, detected=detected_items)
                else:
                    error_msg = await response.text()
                    logger.error(f"AI 서버 오류: {error_msg}")
                    return JSONResponse(
                        content={"error": "AI 서버 오류", "details": error_msg},
                        status_code=response.status,
                    )
    except aiohttp.ClientError:
        logger.exception("AI 서버와 통신 중 오류 발생")
        return JSONResponse(content={"error": "AI 서버와 통신 실패"}, status_code=502)
    except Exception as e:
        logger.exception("예측 처리 중 오류 발생")
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.get("/results", response_model=List[DetectionResult])
def get_results(db: Session = Depends(get_db)):
    return crud_food.get_all_food_detections(db)
