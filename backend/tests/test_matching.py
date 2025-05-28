# backend/tests/test_matching.py

from sqlalchemy.orm import Session
from backend.db import SessionLocal
from backend.app.services.matching import auto_match_foods_from_input

# 예시 입력
input_text = "감자, 양파"

# DB 세션
db: Session = SessionLocal()

matched = auto_match_foods_from_input(input_text, db)
print("매칭된 food_id 목록:", matched)

db.close()
