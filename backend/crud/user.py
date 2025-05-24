from sqlalchemy.orm import Session
from backend import models, schemas
from backend.app.auth.utils import hash_password

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user: schemas.UserCreateWithPassword):
    hashed_pw = hash_password(user.password)
    db_user = models.User(
        username=user.username,  # ✅ 추가된 필드
        email=user.email,
        nickname=user.nickname,
        profile_image_url=user.profile_image_url,
        password_hash=hashed_pw,
        oauth_provider=user.oauth_provider,
        oauth_id=user.oauth_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
