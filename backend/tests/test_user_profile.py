# backend/tests/test_user_profile.py

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_update_profile_nickname_and_image(authenticated_headers):
    data = {
        "nickname": "바뀐닉네임",
        "profile_image_url": "http://example.com/new-image.jpg"
    }
    res = client.patch("/api/users/me", headers=authenticated_headers, json=data)
    assert res.status_code == 200
    assert res.json()["nickname"] == data["nickname"]
    assert res.json()["profile_image_url"] == data["profile_image_url"]

def test_update_profile_nickname_only(authenticated_headers):
    data = {
        "nickname": "닉네임만변경"
    }
    res = client.patch("/api/users/me", headers=authenticated_headers, json=data)
    assert res.status_code == 200
    assert res.json()["nickname"] == data["nickname"]

def test_update_profile_image_only(authenticated_headers):
    data = {
        "profile_image_url": "http://example.com/only-image.jpg"
    }
    res = client.patch("/api/users/me", headers=authenticated_headers, json=data)
    assert res.status_code == 200
    assert res.json()["profile_image_url"] == data["profile_image_url"]

def test_change_password(authenticated_headers):
    new_password_data = {
        "current_password": "TestPassword123!",
        "new_password": "NewPassword456!",
        "new_password_check": "NewPassword456!" 
    }
    res = client.patch("/api/users/me/password", headers=authenticated_headers, json=new_password_data)
    assert res.status_code == 200
    assert res.json()["message"] == "비밀번호가 성공적으로 변경되었습니다."

def test_get_social_status(authenticated_headers):
    res = client.get("/api/users/me/social", headers=authenticated_headers)
    assert res.status_code == 200
    assert res.json()["oauth_provider"] is None  # 기본은 소셜 계정이 아님

def test_disconnect_social_account_fails_for_non_social_user(authenticated_headers):
    # 소셜 계정이 아닌 경우에는 disconnect 시도 시 실패해야 함
    res = client.delete("/api/users/me/social/naver", headers=authenticated_headers)
    assert res.status_code == 400
    assert res.json()["detail"] == "No such social provider connected"

def test_delete_current_user(authenticated_headers):
    res = client.delete("/api/users/me", headers=authenticated_headers)
    assert res.status_code == 204

    # 삭제 이후 access 시도 시 401 또는 404
    res_check = client.get("/api/auth/me", headers=authenticated_headers)
    assert res_check.status_code in [401, 404]
