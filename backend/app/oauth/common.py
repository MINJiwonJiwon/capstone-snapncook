# backend/app/oauth/common.py
from fastapi import HTTPException
from sqlalchemy.orm import Session
from backend import models, schemas


def get_or_create_oauth_user(db: Session, *, email: str, nickname: str, profile_image_url: str, oauth_provider: str, oauth_id: str): 
    user_data = schemas.UserCreateOAuth(
        email=email,
        nickname=nickname,
        profile_image_url=profile_image_url,
        oauth_provider=oauth_provider,
        oauth_id=oauth_id
    )

    print(f"🔥 들어온 요청: provider={user_data.oauth_provider}, oauth_id={user_data.oauth_id}, email={user_data.email}")

    # 1. 이미 소셜 계정이 연결된 사용자 확인
    user = (
        db.query(models.User)
        .join(models.SocialAccount)
        .filter(
            models.SocialAccount.provider == user_data.oauth_provider,
            models.SocialAccount.oauth_id == user_data.oauth_id
        )
        .first()
    )
    print(f"🔍 SocialAccount로 찾은 user: {user}")
    if user:
        return user

    # 2. email 기준 기존 사용자 있는지 확인
    email_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    print(f"📧 이메일로 찾은 user: {email_user}")

    if email_user:
        # 기존 유저가 있고, 소셜 연동이 아직 안 되어 있으면 자동으로 연결
        existing_social = db.query(models.SocialAccount).filter_by(
            user_id=email_user.id,
            provider=user_data.oauth_provider
        ).first()

        if not existing_social:
            print("🔗 기존 유저에 소셜 계정 자동 연결 진행")
            social = models.SocialAccount(
                user_id=email_user.id,
                provider=user_data.oauth_provider,
                oauth_id=user_data.oauth_id
            )
            db.add(social)
            db.commit()

        return email_user

    # 3. 신규 사용자 + 소셜 계정 생성
    user = models.User(
        email=user_data.email,
        nickname=user_data.nickname,
        profile_image_url=user_data.profile_image_url,
        oauth_provider=user_data.oauth_provider,
        oauth_id=user_data.oauth_id
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    social = models.SocialAccount(
        user_id=user.id,
        provider=user_data.oauth_provider,
        oauth_id=user_data.oauth_id
    )
    db.add(social)
    db.commit()

    print(f"✅ 신규 user 및 social_account 생성 완료: user_id={user.id}")
    return user
