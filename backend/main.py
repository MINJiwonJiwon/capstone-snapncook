from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from backend.db import SessionLocal, get_db 
from backend.routers import user, food, recipe, recipestep, detectionresult, review, userlog, useringredientinput, useringredientinputrecipe
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

# ✅ 미들웨어 추가
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET_KEY", "super-secret"))

# ✅ DB 연결 확인용 테스트 엔드포인트
@app.get("/")
def read_root(db: Session = Depends(get_db)):
    return {"message": "DB 연결 테스트 성공!"}

# 라우터 등록
app.include_router(user.router)  # user 라우터 등록
app.include_router(food.router)  # food 라우터 등록
app.include_router(recipe.router)  # recipe 라우터 등록
app.include_router(recipestep.router)  # recipestep 라우터 등록
app.include_router(detectionresult.router)  # detectionresult 라우터 등록
app.include_router(review.router)  # review 라우터 등록
app.include_router(userlog.router)  # userlog 라우터 등록
app.include_router(useringredientinput.router)  # useringredientinput 라우터 등록
app.include_router(useringredientinputrecipe.router)  # useringredientinputrecipe 라우터 등록
app.include_router(auth.router) # auth 라우터 등록
app.include_router(oauth.router) # oauth 라우터 등록
