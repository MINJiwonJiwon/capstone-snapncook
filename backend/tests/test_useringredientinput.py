# backend/tests/test_useringredientinput.py

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.db import get_db
from sqlalchemy.orm import Session

from backend.tests.test_user import test_create_user

client = TestClient(app)

@pytest.fixture(scope="function")
def db_session():
    db: Session = next(get_db())
    db.begin()
    yield db
    db.rollback()

def create_user_ingredient_input(db_session, user_id):
    """user_ingredient_input 데이터를 생성하는 함수"""
    input_data = {
        "user_id": user_id,
        "input_text": "김치, 돼지고기, 마늘"  # 예시로 재료들 입력
    }
    input_response = client.post("/user-ingredient-inputs/", json=input_data)
    assert input_response.status_code in [200, 201]
    return input_response.json()["id"]

def test_create_user_ingredient_input(db_session: Session):
    """user_ingredient_input 데이터 생성 테스트"""
    user_id = test_create_user(db_session)  # 유저 생성
    input_id = create_user_ingredient_input(db_session, user_id)  # 입력 생성
    assert input_id is not None  # 생성된 입력 데이터의 ID가 존재하는지 확인

def test_get_user_ingredient_input(db_session: Session):
    """특정 user_ingredient_input을 가져오는 테스트"""
    user_id = test_create_user(db_session)  # 유저 생성
    input_id = create_user_ingredient_input(db_session, user_id)  # 입력 생성
    response = client.get(f"/user-ingredient-inputs/{input_id}")
    assert response.status_code == 200
    assert response.json()["id"] == input_id
