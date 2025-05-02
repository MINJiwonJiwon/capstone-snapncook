# backend/tests/test_userlog.py

from uuid import uuid4

def test_create_user_log(auth_client, test_user):
    user_log_data = {
        "action": "회원가입",
        "target_id": 0,
        "target_type": "user",
        "meta": {"additional_info": "회원가입 완료 로그"},
    }

    response = auth_client.post("/user-logs/", json=user_log_data)

    assert response.status_code == 200
    assert response.json()["user_id"] == test_user.id
    assert response.json()["action"] == "회원가입"

def test_get_user_logs(auth_client, test_user):
    # 먼저 로그 생성
    user_log_data = {
        "action": "회원가입",
        "target_id": 0,
        "target_type": "user",
        "meta": {"additional_info": "회원가입 완료 로그"},
    }
    res = auth_client.post("/user-logs/", json=user_log_data)
    assert res.status_code == 200

    # 이후 로그 조회
    response = auth_client.get(f"/user-logs/user/{test_user.id}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert response.json()[0]["action"] == "회원가입"
