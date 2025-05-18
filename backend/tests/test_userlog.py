# backend/tests/test_userlog.py

from typing import Any, Dict
from fastapi.testclient import TestClient
from backend.models import User

def test_create_user_log(auth_client: TestClient, test_user: User):
    user_log_data: Dict[str, Any] = {
        "action": "회원가입",
        "target_id": 0,
        "target_type": "user",
        "meta": {"additional_info": "회원가입 완료 로그"},
    }

    response = auth_client.post("/api/user-logs/", json=user_log_data)

    assert response.status_code == 200
    assert response.json()["user_id"] == test_user.id
    assert response.json()["action"] == "회원가입"

def test_get_user_logs(auth_client: TestClient, test_user: User):
    # 먼저 로그 생성
    user_log_data: Dict[str, Any] = {
        "action": "회원가입",
        "target_id": 0,
        "target_type": "user",
        "meta": {"additional_info": "회원가입 완료 로그"},
    }
    res = auth_client.post("/api/user-logs/", json=user_log_data)
    assert res.status_code == 200

    # 이후 로그 조회
    response = auth_client.get(f"/api/user-logs/user/{test_user.id}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert response.json()[0]["action"] == "회원가입"
