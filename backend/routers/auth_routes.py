# backend/routers/auth.py
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from backend import schemas
from backend.db import get_db
from backend.app.auth import service
from backend.app.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup", response_model=schemas.UserOut)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return service.signup_user(user, db)

@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    access_token = service.login_user(credentials, db)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user=Depends(get_current_user)):
    return current_user

@router.post("/logout")
async def logout(request: Request):
    # 세션 기반 로그인 대비용 (지금은 의미 없음)
    request.session.clear()
    
    return JSONResponse(content={"message": "Logged out successfully"})
