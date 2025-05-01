# backend/models.py
from sqlalchemy import Boolean, Column, Integer, String, Text, Float, ForeignKey, DateTime, JSON, func
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime, timezone

Base = declarative_base()

# 공통 생성일/수정일 필드용 Mixin
class TimestampMixin:
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=True)
    oauth_provider = Column(String, nullable=True)
    oauth_id = Column(String, nullable=True)
    nickname = Column(String, nullable=False)
    profile_image_url = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)

    detection_results = relationship("DetectionResult", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    logs = relationship("UserLog", back_populates="user")
    ingredient_inputs = relationship("UserIngredientInput", back_populates="user")
    social_accounts = relationship("SocialAccount", back_populates="user")
    bookmarks = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")

class SocialAccount(Base):
    __tablename__ = "social_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider = Column(String, nullable=False)  # 'google', 'kakao', 'naver'
    oauth_id = Column(String, nullable=False)

    user = relationship("User", back_populates="social_accounts")

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, nullable=False, unique=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False)

    user = relationship("User")

class Food(Base, TimestampMixin):
    __tablename__ = "foods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)

    recipes = relationship("Recipe", back_populates="food")
    detection_results = relationship("DetectionResult", back_populates="food")
    reviews = relationship("Review", back_populates="food")

class Recipe(Base, TimestampMixin):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    food_id = Column(Integer, ForeignKey("foods.id"), nullable=False)
    source_type = Column(String, nullable=False)
    title = Column(String, nullable=True)
    ingredients = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    source_detail = Column(Text, nullable=True)

    food = relationship("Food", back_populates="recipes")
    steps = relationship("RecipeStep", back_populates="recipe")
    recommended_by_inputs = relationship("UserIngredientInputRecipe", back_populates="recipe")
    bookmarks = relationship("Bookmark", back_populates="recipe", cascade="all, delete-orphan")

class RecipeStep(Base):
    __tablename__ = "recipe_steps"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    step_order = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)

    recipe = relationship("Recipe", back_populates="steps")

class DetectionResult(Base, TimestampMixin):
    __tablename__ = "detection_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    food_id = Column(Integer, ForeignKey("foods.id"), nullable=False)
    image_path = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)

    user = relationship("User", back_populates="detection_results")
    food = relationship("Food", back_populates="detection_results")

class Review(Base, TimestampMixin):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    food_id = Column(Integer, ForeignKey("foods.id"), nullable=False)
    content = Column(Text, nullable=False)
    rating = Column(Integer, nullable=False)

    user = relationship("User", back_populates="reviews")
    food = relationship("Food", back_populates="reviews")

class UserLog(Base):
    __tablename__ = "user_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    target_id = Column(Integer, nullable=False)
    target_type = Column(String, nullable=False)
    meta = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="logs")

class UserIngredientInput(Base):
    __tablename__ = "user_ingredient_inputs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    input_text = Column(Text, nullable=False)
    matched_food_ids = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="ingredient_inputs")
    recommended_recipes = relationship("UserIngredientInputRecipe", back_populates="input")

class UserIngredientInputRecipe(Base):
    __tablename__ = "user_ingredient_input_recipes"

    id = Column(Integer, primary_key=True, index=True)
    input_id = Column(Integer, ForeignKey("user_ingredient_inputs.id"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    rank = Column(Integer, nullable=True)

    input = relationship("UserIngredientInput", back_populates="recommended_recipes")
    recipe = relationship("Recipe", back_populates="recommended_by_inputs")

class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="bookmarks")
    recipe = relationship("Recipe", back_populates="bookmarks")
    