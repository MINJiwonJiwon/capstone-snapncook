# backend/tests/test_recommend.py

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from backend.models import User

def test_recommend_by_detection(auth_client: TestClient, db_session: Session, test_user: User):
    # 탐지 결과 선행 삽입
    from backend.models import DetectionResult
    from backend.tests.test_food import create_food_helper

    food_id = create_food_helper(db_session)
    db_session.add(DetectionResult(
        user_id=test_user.id,
        food_id=food_id,
        image_path="test.jpg",
        confidence=0.98
    ))
    db_session.commit()

    response = auth_client.get("/api/recommend/private/by-detection")
    assert response.status_code in [200, 404]

def test_recommend_by_ingredient(auth_client: TestClient, db_session: Session, test_user: User):
    # 유저 식재료 입력 선행 삽입
    from backend.models import UserIngredientInput
    db_session.add(UserIngredientInput(
        user_id=test_user.id,
        input_text="감자"
    ))
    db_session.commit()

    response = auth_client.get("/api/recommend/private/by-ingredient")
    assert response.status_code in [200, 400, 404]
