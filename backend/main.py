from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from backend.db import get_db 
from backend.routers import admin, home, mypage, user, food, recipe, recipestep, detectionresult, review, userlog, useringredientinput, useringredientinputrecipe, recommend, bookmark
from backend.routers import auth_routes as auth
from backend.routers import oauth_routes as oauth
from starlette.middleware.sessions import SessionMiddleware
from backend.app.tasks.scheduler import start_scheduler
import os

# ✅ lifespan context
@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield

# ✅ FastAPI 앱 생성 시 lifespan 지정
app = FastAPI(lifespan=lifespan)

# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 배포 환경에서는 ["http://localhost:3000", "https://yourdomain.com"] 같이 제한하는 게 안전
    allow_credentials=True,
    allow_methods=["*"],  # "OPTIONS", "POST", "GET", "PUT", "DELETE", ...
    allow_headers=["*"],
)

# ✅ 미들웨어 추가
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET_KEY", "super-secret"))

# ✅ DB 연결 확인용 테스트 엔드포인트
@app.get("/")
def read_root(db: Session = Depends(get_db)):
    return {"message": "DB 연결 테스트 성공!"}

# 라우터 등록
app.include_router(user.router, prefix="/api")
app.include_router(food.router, prefix="/api")
app.include_router(recipe.router, prefix="/api")
app.include_router(recipestep.router, prefix="/api")
app.include_router(detectionresult.router, prefix="/api")
app.include_router(review.router, prefix="/api")
app.include_router(userlog.router, prefix="/api")
app.include_router(useringredientinput.router, prefix="/api")
app.include_router(useringredientinputrecipe.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(oauth.router, prefix="/api")
app.include_router(recommend.router, prefix="/api")
app.include_router(bookmark.router, prefix="/api")
app.include_router(mypage.router, prefix="/api")
app.include_router(home.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
