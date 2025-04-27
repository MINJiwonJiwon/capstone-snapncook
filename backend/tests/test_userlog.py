# backend/tests/test_userlog.py

from uuid import uuid4
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.db import get_db
from sqlalchemy.orm import Session

client = TestClient(app)

@pytest.fixture(scope="function")
def db_session():
    db: Session = next(get_db())
    db.begin()
    yield db
    db.rollback()

def test_create_user_log(db_session: Session):
    user_data = {
        "email": f"testuser{uuid4()}@example.com",  # 유니크한 이메일 생성
        "password": "Password123!",  # 특수문자와 숫자가 포함된 비밀번호
        "nickname": "테스트유저"
    }

    # 회원가입
    create_user_response = client.post("/auth/signup", json=user_data)
    
    # 응답에서 ID를 가져오기 전에 확인
    assert create_user_response.status_code == 200 or create_user_response.status_code == 201, \
        f"Expected 200 or 201, got {create_user_response.status_code}"
    
    response_json = create_user_response.json()
    assert "id" in response_json, "User ID is missing in response"
    
    user_id = response_json["id"]

    # user_id를 사용하여 로그 생성
    user_log_data = {
        "user_id": user_id,  # 생성된 유저의 ID
        "action": "회원가입",  # 예: 회원가입을 했다는 로그
        "target_id": 0,  # 회원가입에는 관련된 대상이 없음
        "target_type": "user",  # 'user' 타입으로 설정
        "meta": {"additional_info": "회원가입 완료 로그"},  # 선택적인 메타데이터
    }

    # 로그 생성
    response = client.post("/user-logs/", json=user_log_data)
    
    assert response.status_code == 200
    assert response.json()["user_id"] == user_id
    assert response.json()["action"] == "회원가입"

def test_get_user_logs(db_session: Session):
    # 유저를 동적으로 생성한 후, 그 유저의 ID를 사용
    user_data = {
        "email": f"testuser{uuid4()}@example.com",
        "password": "Password123!",
        "nickname": "테스트유저"
    }

    create_user_response = client.post("/auth/signup", json=user_data)
    assert create_user_response.status_code in [200, 201]
    user_id = create_user_response.json()["id"]

    # (✅) 먼저 유저 로그 생성
    user_log_data = {
        "user_id": user_id,
        "action": "회원가입",
        "target_id": 0,
        "target_type": "user",
        "meta": {"additional_info": "회원가입 완료 로그"}
    }
    create_log_response = client.post("/user-logs/", json=user_log_data)
    assert create_log_response.status_code == 200

    # (✅) 그리고 나서 유저 로그 조회
    response = client.get(f"/user-logs/user/{user_id}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
