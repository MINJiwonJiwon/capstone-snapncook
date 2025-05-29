# backend/app/auth/dependencies.py

from typing import Optional
from fastapi import Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from backend.crud import get_user_by_id
from backend.db import get_db
from sqlalchemy.orm import Session
from backend import models
from backend.app.auth.utils import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(models.User).filter(models.User.id == int(payload["sub"])).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user

async def get_current_user_from_request(request: Request) -> Optional[models.User]:
    token = request.headers.get("Authorization")
    if token and token.startswith("Bearer "):
        try:
            token = token.split("Bearer ")[1]
            payload = decode_access_token(token)
            if not payload:
                return None  # 또는 raise 에러
            db: Session = next(get_db())
            user_id_raw = payload.get("sub")
            if user_id_raw is None:
                return None
            user_id = int(user_id_raw)
            return get_user_by_id(db, user_id)
        except Exception:
            return None
    return None
