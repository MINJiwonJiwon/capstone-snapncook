# backend/routers/auth_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend import schemas
from backend.db import get_db
from backend.app.auth import service
from backend.app.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup", response_model=schemas.UserOut)
def signup(user: schemas.UserCreateWithPassword, db: Session = Depends(get_db)):
    return service.signup_user(user, db)

@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    return service.login_user(credentials, db)

@router.post("/refresh", response_model=schemas.Token)
def refresh(token_data: schemas.RefreshTokenRequest, db: Session = Depends(get_db)):
    return service.refresh_access_token(token_data.refresh_token, db)

@router.post("/logout", response_model=dict)
def logout(token_data: schemas.RefreshTokenRequest, db: Session = Depends(get_db)):
    service.logout_user(token_data.refresh_token, db)
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user=Depends(get_current_user)):
    return current_user
