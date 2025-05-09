# backend/app/oauth/naver.py
from fastapi import APIRouter, HTTPException, Request, Depends
from authlib.integrations.starlette_client import OAuth
from sqlalchemy.orm import Session
from fastapi.responses import RedirectResponse
from backend.app.auth.utils import create_access_token
from backend.db import get_db
from backend.app.oauth.common import get_or_create_oauth_user
import os

router = APIRouter()
oauth = OAuth()

oauth.register(
    name="naver",
    client_id=os.getenv("NAVER_CLIENT_ID"),
    client_secret=os.getenv("NAVER_CLIENT_SECRET"),
    authorize_url="https://nid.naver.com/oauth2.0/authorize",
    access_token_url="https://nid.naver.com/oauth2.0/token",
    api_base_url="https://openapi.naver.com/v1/nid/",
    client_kwargs={"scope": "profile email"}
)

@router.get("/login")
async def login(request: Request):
    redirect_uri = os.getenv("NAVER_REDIRECT_URI")
    return await oauth.naver.authorize_redirect(request, redirect_uri)

@router.get("/callback")
async def callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.naver.authorize_access_token(request)

    # 사용자 정보 요청
    resp = await oauth.naver.get("https://openapi.naver.com/v1/nid/me", token=token)
    profile = resp.json()

    print("🔥 Naver userinfo:", profile)

    response_data = profile.get("response", {})
    naver_id = str(response_data.get("id"))
    email = response_data.get("email")
    name = response_data.get("name", "네이버유저")

    print(f"🔥 email: {email}")
    print(f"🔥 naver_id: {naver_id}")

    if not naver_id or not email:
        raise HTTPException(status_code=400, detail="네이버 사용자 정보 부족 (id 또는 email 없음)")

    user_data = {
        "email": email,
        "nickname": name,
        "profile_image_url": response_data.get("profile_image", None),
        "oauth_provider": "naver",
        "oauth_id": naver_id
    }

    user = get_or_create_oauth_user(db=db, **user_data)

    return {"access_token": create_access_token(data={"sub": str(user.id)})}
