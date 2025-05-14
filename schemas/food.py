from pydantic import BaseModel
from typing import List

class FoodDetectionBase(BaseModel):
    name: str
    confidence: float
    image_filename: str

class FoodDetectionCreate(FoodDetectionBase):
    pass

class FoodDetection(FoodDetectionBase):
    id: int

    class Config:
        orm_mode = True

# ✅ /predict 응답용 모델
class PredictResponse(BaseModel):
    filename: str
    detected: List[FoodDetectionBase]
