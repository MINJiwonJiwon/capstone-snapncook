from sqlalchemy.orm import Session
from models.food import FoodDetection
from schemas.food import FoodDetectionCreate
from typing import List

def create_food_detection(db: Session, detection: FoodDetectionCreate) -> FoodDetection:
    db_detection = FoodDetection(**detection.dict())
    db.add(db_detection)
    db.commit()
    db.refresh(db_detection)
    return db_detection

def get_all_food_detections(db: Session) -> List[FoodDetection]:
    return db.query(FoodDetection).all()
