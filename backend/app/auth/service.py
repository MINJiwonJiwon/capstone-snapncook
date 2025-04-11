# backend/app/auth/service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend import models, schemas, crud
from . import utils

def signup_user(user: schemas.UserCreate, db: Session) -> models.User:
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user.password_hash = utils.hash_password(user.password_hash)
    return crud.create_user(db, user)

def login_user(credentials: schemas.UserLogin, db: Session) -> str:
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not utils.verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")
    return utils.create_access_token({"sub": str(user.id)})
