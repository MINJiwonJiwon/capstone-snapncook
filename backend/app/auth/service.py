# backend/app/auth/servies.py
from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend import models, schemas, crud
from backend.app.auth import utils
from backend.app.auth.token_utils import (
    create_refresh_token,
    verify_refresh_token,
    revoke_refresh_token,
)

def signup_user(user: schemas.UserCreateWithPassword, db: Session) -> models.User:
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user.password_hash = utils.hash_password(user.password)
    return crud.create_user(db, user)


def login_user(credentials: schemas.UserLogin, db: Session) -> dict:
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not utils.verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    access_token = utils.create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token(user.id, db)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


def refresh_access_token(refresh_token: str, db: Session) -> dict:
    db_token = verify_refresh_token(refresh_token, db)
    access_token = utils.create_access_token({"sub": str(db_token.user_id)})
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


def logout_user(refresh_token: str, db: Session) -> dict:
    revoke_refresh_token(refresh_token, db)
    return {"msg": "Logged out"}
