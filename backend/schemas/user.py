from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# 공통 사용자 출력용 스키마
class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    nickname: Optional[str]
    profile_image_url: Optional[str]
    oauth_provider: Optional[str]
    oauth_id: Optional[str]

    class Config:
        orm_mode = True


# 회원가입 시 사용자가 입력하는 데이터 (비밀번호 포함)
class UserCreateWithPassword(BaseModel):
    username: str = Field(..., max_length=50)
    email: EmailStr
    nickname: Optional[str] = None
    profile_image_url: Optional[str] = None
    password: str = Field(..., min_length=8)
    oauth_provider: Optional[str] = None
    oauth_id: Optional[str] = None


# 프로필 수정용 (닉네임, 프로필 이미지)
class UserUpdateProfile(BaseModel):
    nickname: Optional[str] = None
    profile_image_url: Optional[str] = None


# 비밀번호 변경용
class UserUpdatePassword(BaseModel):
    current_password: str
    new_password: str
    new_password_check: str
