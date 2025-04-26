# backend/tests/test_userlog.py

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
        "email": "testuser@example.com",
        "password": "password123",
        "nickname": "테스트유저"
    }
    create_user_response = client.post("/auth/signup", json=user_data)
    user_id = create_user_response.json()["id"]
    
    log_data = {
        "user_id": user_id,
        "action": "Login",
        "target_id": 1,
        "target_type": "User"
    }
    response = client.post("/user-logs/", json=log_data)
    assert response.status_code == 200
    assert response.json()["action"] == log_data["action"]

def test_get_user_logs(db_session: Session):
    response = client.get("/user-logs/user/1")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
