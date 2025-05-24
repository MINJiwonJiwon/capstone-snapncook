from pydantic import BaseModel
from typing import List

# 기본 FoodDetection 정보 (입력/출력 공용)
class FoodDetectionBase(BaseModel):
    name: str
    confidence: float
    image_filename: str

# DB에 저장할 때 사용하는 모델 (필요 시 확장 가능)
class FoodDetectionCreate(FoodDetectionBase):
    pass

# DB에서 읽어올 때 사용하는 모델 (id 포함)
class FoodDetection(FoodDetectionBase):
    id: int

    class Config:
        orm_mode = True  # SQLAlchemy 모델과 호환

# /predict 엔드포인트의 응답용 모델
class PredictResponse(BaseModel):
    filename: str
    detected: List[FoodDetectionBase]
