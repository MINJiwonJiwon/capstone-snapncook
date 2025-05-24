# backend/tests/test_oauth.py

from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from backend.main import app
from starlette.responses import RedirectResponse

client = TestClient(app)

# Google OAuth 테스트
@patch("backend.app.oauth.google.oauth.google.authorize_redirect", new_callable=AsyncMock)
def test_oauth_login_google(mock_authorize_redirect: MagicMock):
    mock_authorize_redirect.return_value = RedirectResponse(url="https://mocked-redirect.com", status_code=307)
    response = client.get("/api/oauth/google/login", follow_redirects=False)
    assert response.status_code == 307

# Kakao OAuth 테스트
@patch("backend.app.oauth.kakao.oauth.kakao.authorize_redirect", new_callable=AsyncMock)
def test_oauth_login_kakao(mock_authorize_redirect: MagicMock):
    mock_authorize_redirect.return_value = RedirectResponse(url="https://mocked-redirect.com", status_code=307)
    response = client.get("/api/oauth/kakao/login", follow_redirects=False)
    assert response.status_code == 307

# Naver OAuth 테스트
@patch("backend.app.oauth.naver.oauth.naver.authorize_redirect", new_callable=AsyncMock)
def test_oauth_login_naver(mock_authorize_redirect: MagicMock):
    mock_authorize_redirect.return_value = RedirectResponse(url="https://mocked-redirect.com", status_code=307)
    response = client.get("/api/oauth/naver/login", follow_redirects=False)
    assert response.status_code == 307
