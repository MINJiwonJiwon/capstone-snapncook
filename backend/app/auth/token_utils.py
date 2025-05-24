# backend/app/auth/token_utils.py
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from backend import models


def create_refresh_token(user_id: int, db: Session) -> str:
    """
    UUID 기반 refresh token을 생성하고 DB에 저장한 후, 해당 토큰 문자열을 반환한다.
    """
    token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)

    db_token = models.RefreshToken(
        user_id=user_id,
        token=token,
        expires_at=expires_at
    )

    try:
        db.add(db_token)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create refresh token")

    return token


def verify_refresh_token(token: str, db: Session) -> models.RefreshToken:
    """
    주어진 refresh token이 유효한지 검사하고, 유효한 경우 해당 DB 객체를 반환한다.
    """
    db_token = db.query(models.RefreshToken).filter(
        models.RefreshToken.token == token,
        models.RefreshToken.revoked == False,
        models.RefreshToken.expires_at > datetime.now(timezone.utc)
    ).first()

    if not db_token:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    return db_token


def revoke_refresh_token(token: str, db: Session) -> None:
    """
    주어진 refresh token을 폐기 처리 (revoked = True).
    """
    db_token = db.query(models.RefreshToken).filter(
        models.RefreshToken.token == token
    ).first()

    if db_token:
        db_token.revoked = True
        db.commit()
