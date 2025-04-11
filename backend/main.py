from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from backend.db import SessionLocal, get_db 
from backend.routers import user, food, recipe, recipestep, detectionresult, review, userlog, useringredientinput, useringredientinputrecipe
from backend.routers import auth_routes as auth

app = FastAPI()

# DB 연결 확인
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
