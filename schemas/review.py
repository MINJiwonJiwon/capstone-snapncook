# schemas/review.py

from pydantic import BaseModel

class ReviewBase(BaseModel):
    review_text: str
    rating: int

class ReviewCreate(ReviewBase):
    user_id: int  # 로그인 기능이 없을 경우 직접 받아야 함

class Review(ReviewBase):
    id: int
    user_id: int
    recipe_id: int

    class Config:
        orm_mode = True
