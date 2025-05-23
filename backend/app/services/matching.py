# backend/app/services/matching.py

from backend import models
from sqlalchemy.orm import Session

def auto_match_foods_from_input(input_text: str, db: Session) -> list[int]:
    ingredients = [i.strip() for i in input_text.split(",") if i.strip()]
    matched_foods = db.query(models.Food).filter(models.Food.name.in_(ingredients)).all()
    return [f.id for f in matched_foods]
