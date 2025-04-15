# backend/schemas.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# ---------- User ----------
class UserBase(BaseModel):
    email: str
    nickname: str
    profile_image_url: Optional[str] = None
    oauth_provider: Optional[str] = None
    oauth_id: Optional[str] = None

class SocialAccountRead(BaseModel):
    provider: str
    oauth_id: str

    class Config:
        from_attributes = True

class UserCreate(UserBase):
    password: str
    password_hash: Optional[str] = None  # 소셜 로그인 시에는 생략 가능

class UserOut(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    social_accounts: List[SocialAccountRead] = []

    class Config:
        from_attributes = True

# ------------ UserLogin ----------------
# 로그인 요청용
class UserLogin(BaseModel):
    email: str
    password: str

# 토큰 반환용
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
