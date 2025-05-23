from sqlalchemy.orm import Session
from backend import models, schemas
from backend.app.auth.utils import hash_password

def create_user(db: Session, user: schemas.UserCreateWithPassword) -> models.User:
    db_user = models.User(
        username=user.username,
        email=user.email,
        nickname=user.nickname,
        profile_image_url=user.profile_image_url,
        password_hash=hash_password(user.password),
        oauth_provider=user.oauth_provider,
        oauth_id=user.oauth_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# 필요시 더 CRUD 함수 작성 가능 (예: get_user_by_id, update_user, delete_user 등)
