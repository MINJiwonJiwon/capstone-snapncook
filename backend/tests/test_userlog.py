# backend/tests/test_userlog.py

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_create_user_log():
    log_data = {
        "user_id": 1,
        "action": "Login",
        "target_id": 1,
        "target_type": "User"
    }
    response = client.post("/user-logs/", json=log_data)
    assert response.status_code == 200
    assert response.json()["action"] == log_data["action"]

def test_get_user_logs():
    response = client.get("/user-logs/user/1")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
