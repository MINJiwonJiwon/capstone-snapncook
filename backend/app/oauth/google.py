# backend/app/oauth/google.py
from fastapi import APIRouter, Depends, Request
from backend.db import get_db
from sqlalchemy.orm import Session
from backend.app.auth.utils import create_access_token
from backend.app.oauth.common import get_or_create_oauth_user
import os
from authlib.integrations.starlette_client import OAuth

router = APIRouter()
oauth = OAuth()

# 🔐 Google OAuth 설정
oauth.register(
    name='google',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    access_token_url='https://oauth2.googleapis.com/token',
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile',
        'response_type': 'code'  # ✅ 명시적으로 작성
    }
)

# 🔗 로그인 리디렉션 엔드포인트
@router.get("/login")
async def login(request: Request):
    redirect_uri = os.getenv('GOOGLE_REDIRECT_URI')
    return await oauth.google.authorize_redirect(request, redirect_uri)

# 🔁 콜백 핸들러
@router.get("/callback")
async def callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    profile = (await oauth.google.get('userinfo', token=token)).json()

    print("🔥 Google userinfo:", profile)
    print("🔥 email:", profile.get("email"))
    print("🔥 sub:", profile.get("sub"))

    user = get_or_create_oauth_user(
        db=db,
        email=profile.get("email"),
        nickname=profile.get("name"),
        profile_image_url=profile.get("picture"),
        oauth_provider="google",
        oauth_id=profile.get("id")
    )

    return {"access_token": create_access_token(data={"sub": str(user.id)})}
