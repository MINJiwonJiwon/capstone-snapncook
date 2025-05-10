# backend/app/oauth/kakao.py
from fastapi import APIRouter, Request, Depends, HTTPException
from authlib.integrations.starlette_client import OAuth
from sqlalchemy.orm import Session
from backend.app.auth.utils import create_access_token
from backend.db import get_db
from .common import get_or_create_oauth_user
import os

router = APIRouter()
oauth = OAuth()

oauth.register(
    name="kakao",
    client_id=os.getenv("KAKAO_CLIENT_ID"),
    client_secret=os.getenv("KAKAO_CLIENT_SECRET"),
    authorize_url="https://kauth.kakao.com/oauth/authorize",
    access_token_url="https://kauth.kakao.com/oauth/token",
    api_base_url="https://kapi.kakao.com/v2/user/me",
    client_kwargs={"scope": "profile_nickname profile_image account_email"}
)

@router.get("/login")
async def login(request: Request):
    redirect_uri = os.getenv("KAKAO_REDIRECT_URI")
    return await oauth.kakao.authorize_redirect(request, redirect_uri)

@router.get("/callback")
async def callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.kakao.authorize_access_token(request)
        resp = await oauth.kakao.get("https://kapi.kakao.com/v2/user/me", token=token)
        profile = resp.json()

        print("🔥 Kakao userinfo:", profile)

        kakao_id = str(profile["id"])
        account = profile.get("kakao_account", {})
        profile_info = account.get("profile", {})

        email = account.get("email", f"kakao_{kakao_id}@example.com")
        nickname = profile_info.get("nickname", "카카오유저")
        profile_image_url = profile_info.get("profile_image_url")

        print(f"🔥 email: {email}")
        print(f"🔥 kakao_id: {kakao_id}")

        user_data = {
            "email": email,
            "nickname": nickname,
            "profile_image_url": profile_image_url,
            "oauth_provider": "kakao",
            "oauth_id": kakao_id,
        }

        user = get_or_create_oauth_user(db=db, **user_data)
        access_token = create_access_token(data={"sub": str(user.id)})
        return {"access_token": access_token}

    except Exception as e:
        print("❌ Kakao OAuth 인증 실패:", e)
        return {"error": "Kakao OAuth 인증 중 오류가 발생했습니다."}
