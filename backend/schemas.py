# backend/schemas.py
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime

# ---------- User ----------
# 공통 유저 속성 (Base)
class UserBase(BaseModel):
    email: str
    nickname: str
    profile_image_url: Optional[str] = None
    oauth_provider: Optional[str] = None
    oauth_id: Optional[str] = None

# 소셜 계정 정보
class SocialAccountRead(BaseModel):
    provider: str
    oauth_id: str

    class Config:
        from_attributes = True

# ✅ 일반 회원가입용 - 비밀번호 필수 + 유효성 검사 포함
class UserCreateWithPassword(UserBase):
    password: str = Field(
        ..., min_length=8, max_length=128,
        description="비밀번호는 8자 이상이며, 숫자와 특수문자를 포함해야 합니다."
    )
    password_hash: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if not any(char.isdigit() for char in v):
            raise ValueError("비밀번호에는 최소 1개의 숫자가 포함되어야 합니다.")
        if not any(char in "@$!%*#?&" for char in v):
            raise ValueError("비밀번호에는 최소 1개의 특수문자(@$!%*#?&)가 포함되어야 합니다.")
        return v

# ✅ 소셜 로그인용 - 비밀번호 없이 생성
class UserCreateOAuth(UserBase):
    password_hash: Optional[str] = None

# 응답용 유저 정보
class UserOut(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    social_accounts: List[SocialAccountRead] = []

    class Config:
        from_attributes = True

# 로그인 요청용
class UserLogin(BaseModel):
    email: str
    password: str

# 프로필 수정 용도
class UserUpdateProfile(BaseModel):
    nickname: Optional[str] = None
    profile_image_url: Optional[str] = None

# 비밀번호 수정 용도
class UserUpdatePassword(BaseModel):
    current_password: str
    new_password: str

# 토큰 관련
class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"

class RefreshTokenRequest(BaseModel):
    refresh_token: str

# ---------- Food ----------
class FoodBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class FoodCreate(FoodBase):
    pass

class FoodOut(FoodBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ---------- Recipe ----------
class RecipeBase(BaseModel):
    food_id: int
    source_type: str
    title: Optional[str] = None
    ingredients: Optional[str] = None
    instructions: Optional[str] = None
    source_detail: Optional[str] = None

class RecipeCreate(RecipeBase):
    pass

class RecipeOut(RecipeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ---------- Recipe Step ----------
class RecipeStepBase(BaseModel):
    recipe_id: int
    step_order: int
    description: str
    image_url: Optional[str] = None

class RecipeStepCreate(RecipeStepBase):
    pass

class RecipeStepOut(RecipeStepBase):
    id: int

    class Config:
        from_attributes = True

# ---------- Detection Result ----------
class DetectionResultBase(BaseModel):
    user_id: int
    food_id: int
    image_path: str
    confidence: float

class DetectionResultCreate(DetectionResultBase):
    pass

class DetectionResultOut(DetectionResultBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ---------- Review ----------
class ReviewBase(BaseModel):
    user_id: int
    food_id: int
    content: str
    rating: int

class ReviewCreate(ReviewBase):
    pass

class ReviewOut(ReviewBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ---------- User Log ----------
class UserLogBase(BaseModel):
    user_id: int
    action: str
    target_id: int
    target_type: str
    meta: Optional[dict] = None

class UserLogCreate(UserLogBase):
    pass

class UserLogOut(UserLogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ---------- User Ingredient Input ----------
class UserIngredientInputBase(BaseModel):
    user_id: int
    input_text: str
    matched_food_ids: Optional[List[int]] = None

class UserIngredientInputCreate(UserIngredientInputBase):
    pass

class UserIngredientInputOut(UserIngredientInputBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ---------- User Ingredient Input Recipe ----------
class UserIngredientInputRecipeBase(BaseModel):
    input_id: int
    recipe_id: int
    rank: Optional[int] = None

class UserIngredientInputRecipeCreate(UserIngredientInputRecipeBase):
    pass

class UserIngredientInputRecipeOut(UserIngredientInputRecipeBase):
    id: int

    class Config:
        from_attributes = True

# ---------- Recipe Detail 통합 응답 ----------

class FoodSummary(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class RecipeSummary(BaseModel):
    id: int
    title: Optional[str] = None
    ingredients: Optional[str] = None
    instructions: Optional[str] = None

class RecipeStepSummary(BaseModel):
    step_order: int
    description: str
    image_url: Optional[str] = None

class RecipeDetailResponse(BaseModel):
    food: FoodSummary
    recipe: RecipeSummary
    steps: List[RecipeStepSummary]
