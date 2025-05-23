# models/food.py

from sqlalchemy import Column, Integer, String, Float
from db.base import Base

class FoodDetection(Base):
    __tablename__ = "food_detections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    confidence = Column(Float)
    image_filename = Column(String(255))
