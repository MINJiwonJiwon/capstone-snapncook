from fastapi import APIRouter
from backend.app.oauth import google, kakao, naver

router = APIRouter()

# 각 OAuth 라우터 포함
router.include_router(google.router, prefix="/oauth/google", tags=["Google OAuth"])
router.include_router(kakao.router, prefix="/oauth/kakao", tags=["Kakao OAuth"])
router.include_router(naver.router, prefix="/oauth/naver", tags=["Naver OAuth"])
