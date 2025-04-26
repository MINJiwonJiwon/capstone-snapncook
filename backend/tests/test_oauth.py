# backend/tests/test_oauth.py

import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

# Google OAuth 테스트
@patch("backend.app.oauth.google.oauth.google.authorize_redirect")
def test_oauth_login_google(mock_authorize_redirect):
    mock_authorize_redirect.return_value = "mocked_redirect_response"

    response = client.get("/oauth/google/login")
    assert response.status_code == 200 or response.status_code == 307
    assert response.text == 'mocked_redirect_response'

# Kakao OAuth 테스트
@patch("backend.app.oauth.kakao.oauth.kakao.authorize_redirect")
def test_oauth_login_kakao(mock_authorize_redirect):
    mock_authorize_redirect.return_value = "mocked_redirect_response"

    response = client.get("/oauth/kakao/login")
    assert response.status_code == 200 or response.status_code == 307
    assert response.text == 'mocked_redirect_response'

# Naver OAuth 테스트
@patch("backend.app.oauth.naver.oauth.naver.authorize_redirect")
def test_oauth_login_naver(mock_authorize_redirect):
    mock_authorize_redirect.return_value = "mocked_redirect_response"

    response = client.get("/oauth/naver/login")
    assert response.status_code == 200 or response.status_code == 307
    assert response.text == 'mocked_redirect_response'
