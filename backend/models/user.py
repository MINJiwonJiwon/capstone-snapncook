from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    nickname = Column(String(50), nullable=True)
    profile_image_url = Column(String(255), nullable=True)
    password_hash = Column(String(255), nullable=False)
    oauth_provider = Column(String(50), nullable=True)
    oauth_id = Column(String(255), nullable=True)

    # 예시: 유저와 연관된 RefreshToken, Review 같은 관계 (필요하면 추가)
    # refresh_tokens = relationship("RefreshToken", back_populates="user")
    # reviews = relationship("Review", back_populates="user")
