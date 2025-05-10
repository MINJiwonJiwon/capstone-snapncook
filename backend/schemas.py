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

# 일반 회원가입용 - 비밀번호 필수 + 유효성 검사 포함
class UserCreateWithPassword(UserBase):
    password: str = Field(
        ..., min_length=8, max_length=128,
        description="비밀번호는 8자 이상이며, 숫자와 특수문자를 포함해야 합니다."
    )
    password_check: str
    password_hash: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if not any(char.isdigit() for char in v):
            raise ValueError("비밀번호에는 최소 1개의 숫자가 포함되어야 합니다.")
        if not any(char in "@$!%*#?&" for char in v):
            raise ValueError("비밀번호에는 최소 1개의 특수문자(@$!%*#?&)가 포함되어야 합니다.")
        return v

# 소셜 로그인용 - 비밀번호 없이 생성
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
    new_password_check: str

# User 수정용 스키마(관리자)
class UserUpdate(BaseModel):
    nickname: Optional[str] = None
    is_admin: Optional[bool] = None

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

# Food 수정용(관리자)
class FoodUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

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

# Recipe 수정용(관리자)
class RecipeUpdate(BaseModel):
    title: Optional[str] = None
    ingredients: Optional[str] = None
    instructions: Optional[str] = None
    source_detail: Optional[str] = None

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
    food_id: int
    image_path: str
    confidence: float

class DetectionResultCreate(DetectionResultBase):
    user_id: Optional[int] = None

class DetectionResultOut(DetectionResultBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ---------- Review ----------
class ReviewBase(BaseModel):
    food_id: int
    content: str
    rating: int

class ReviewCreate(ReviewBase):
    user_id: Optional[int] = None

class ReviewOut(ReviewBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ReviewUpdate(BaseModel):
    content: Optional[str] = None
    rating: Optional[int] = None

# ---------- User Log ----------
class UserLogBase(BaseModel):
    action: str
    target_id: int
    target_type: str
    meta: Optional[dict] = None

class UserLogCreate(UserLogBase):
    pass

class UserLogOut(UserLogBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ---------- User Ingredient Input ----------
class UserIngredientInputBase(BaseModel):
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

# ---------- Bookmark ----------

class BookmarkBase(BaseModel):
    recipe_id: int

class BookmarkCreate(BookmarkBase):
    pass

class BookmarkOut(BookmarkBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ---------- Mypage ----------

class BookmarkSummary(BaseModel):
    id: int
    recipe_id: int
    recipe_title: Optional[str] = None
    recipe_thumbnail: Optional[str] = None

class DetectionResultSummary(BaseModel):
    id: int
    food_name: Optional[str] = None
    image_path: str
    confidence: float

class ReviewSummary(BaseModel):
    id: int
    food_name: Optional[str] = None
    content: str
    rating: int
    food_image_url: Optional[str] = None

class MypageSummaryResponse(BaseModel):
    bookmarks: List[BookmarkSummary]
    detection_results: List[DetectionResultSummary]
    reviews: List[ReviewSummary]

# ---------- Home ----------

# ✅ 인기 검색어 응답용 스키마
class PopularSearchRanking(BaseModel):
    rank: int
    keyword: str
    previous_rank: Optional[int] = None
    trend: str  # 'up', 'down', 'same', 'new'

class PopularSearchResponse(BaseModel):
    period: str
    rankings: List[PopularSearchRanking]

# ✅ 추천 음식 응답용 스키마
class TodayRecommendedFood(BaseModel):
    id: int
    name: str
    description: Optional[str]
    image_url: Optional[str]
    rating: float
    reason: str

class TodayRecommendedFoodResponse(BaseModel):
    date: str
    food: TodayRecommendedFood
