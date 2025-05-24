# models/review.py

from sqlalchemy import Column, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from db.base import Base  # 기존 Base 클래스

class RecipeReview(Base):
    __tablename__ = "recipe_reviews"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    review_text = Column(Text, nullable=False)
    rating = Column(Integer, nullable=False)

    # 관계 설정 (optional)
    recipe = relationship("Recipe", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
