# backend/models.py

from typing import Any
from sqlalchemy import ForeignKey, Text, DateTime, JSON, func
from sqlalchemy.orm import declarative_base, relationship, Mapped, mapped_column
from datetime import datetime, timezone, date

Base = declarative_base()

# 공통 생성일/수정일 필드용 Mixin
class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(nullable=False, unique=True)
    password_hash: Mapped[str | None] = mapped_column(nullable=True)
    oauth_provider: Mapped[str | None] = mapped_column(nullable=True)
    oauth_id: Mapped[str | None] = mapped_column(nullable=True)
    nickname: Mapped[str] = mapped_column(nullable=False)
    profile_image_url: Mapped[str | None] = mapped_column(nullable=True)
    is_admin: Mapped[bool] = mapped_column(default=False)

    detection_results: Mapped[list["DetectionResult"]] = relationship("DetectionResult", back_populates="user")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="user")
    logs: Mapped[list["UserLog"]] = relationship("UserLog", back_populates="user")
    ingredient_inputs: Mapped[list["UserIngredientInput"]] = relationship("UserIngredientInput", back_populates="user")
    social_accounts: Mapped[list["SocialAccount"]] = relationship("SocialAccount", back_populates="user")
    bookmarks: Mapped[list["Bookmark"]] = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")

class SocialAccount(Base):
    __tablename__ = "social_accounts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    provider: Mapped[str] = mapped_column(nullable=False)
    oauth_id: Mapped[str] = mapped_column(nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="social_accounts")

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    token: Mapped[str] = mapped_column(nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at: Mapped[datetime] = mapped_column(nullable=False)
    revoked: Mapped[bool] = mapped_column(default=False)

    user: Mapped["User"] = relationship("User")

class Food(Base, TimestampMixin):
    __tablename__ = "foods"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(nullable=True)

    recipes: Mapped[list["Recipe"]] = relationship("Recipe", back_populates="food")
    detection_results: Mapped[list["DetectionResult"]] = relationship("DetectionResult", back_populates="food")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="food")

class Recipe(Base, TimestampMixin):
    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    food_id: Mapped[int] = mapped_column(ForeignKey("foods.id"), nullable=False)
    source_type: Mapped[str] = mapped_column(nullable=False)
    title: Mapped[str | None] = mapped_column(nullable=True)
    ingredients: Mapped[str | None] = mapped_column(Text, nullable=True)
    instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_detail: Mapped[str | None] = mapped_column(Text, nullable=True)

    food: Mapped["Food"] = relationship("Food", back_populates="recipes")
    steps: Mapped[list["RecipeStep"]] = relationship("RecipeStep", back_populates="recipe")
    recommended_by_inputs: Mapped[list["UserIngredientInputRecipe"]] = relationship("UserIngredientInputRecipe", back_populates="recipe")
    bookmarks: Mapped[list["Bookmark"]] = relationship("Bookmark", back_populates="recipe", cascade="all, delete-orphan")

class RecipeStep(Base):
    __tablename__ = "recipe_steps"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id"), nullable=False)
    step_order: Mapped[int] = mapped_column(nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    image_url: Mapped[str | None] = mapped_column(nullable=True)

    recipe: Mapped["Recipe"] = relationship("Recipe", back_populates="steps")

class DetectionResult(Base, TimestampMixin):
    __tablename__ = "detection_results"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    food_id: Mapped[int] = mapped_column(ForeignKey("foods.id"), nullable=False)
    image_path: Mapped[str] = mapped_column(nullable=False)
    confidence: Mapped[float] = mapped_column(nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="detection_results")
    food: Mapped["Food"] = relationship("Food", back_populates="detection_results")

class Review(Base, TimestampMixin):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    food_id: Mapped[int] = mapped_column(ForeignKey("foods.id"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    rating: Mapped[int] = mapped_column(nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="reviews")
    food: Mapped["Food"] = relationship("Food", back_populates="reviews")

class UserLog(Base):
    __tablename__ = "user_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    action: Mapped[str] = mapped_column(nullable=False)
    target_id: Mapped[int] = mapped_column(nullable=False)
    target_type: Mapped[str] = mapped_column(nullable=False)
    meta: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship("User", back_populates="logs")

class UserIngredientInput(Base):
    __tablename__ = "user_ingredient_inputs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    input_text: Mapped[str] = mapped_column(Text, nullable=False)
    matched_food_ids: Mapped[list[int] | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship("User", back_populates="ingredient_inputs")
    recommended_recipes: Mapped[list["UserIngredientInputRecipe"]] = relationship("UserIngredientInputRecipe", back_populates="input")

class UserIngredientInputRecipe(Base):
    __tablename__ = "user_ingredient_input_recipes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    input_id: Mapped[int] = mapped_column(ForeignKey("user_ingredient_inputs.id"), nullable=False)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id"), nullable=False)
    rank: Mapped[int | None] = mapped_column(nullable=True)

    input: Mapped["UserIngredientInput"] = relationship("UserIngredientInput", back_populates="recommended_recipes")
    recipe: Mapped["Recipe"] = relationship("Recipe", back_populates="recommended_by_inputs")

class Bookmark(Base):
    __tablename__ = "bookmarks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="bookmarks")
    recipe: Mapped["Recipe"] = relationship("Recipe", back_populates="bookmarks")

class SearchLog(Base, TimestampMixin):
    __tablename__ = "search_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    keyword: Mapped[str] = mapped_column(nullable=False, index=True)

class SearchRanking(Base, TimestampMixin):
    __tablename__ = "search_rankings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    keyword: Mapped[str] = mapped_column(nullable=False, index=True)
    rank: Mapped[int] = mapped_column(nullable=False)
    count: Mapped[int] = mapped_column(nullable=False)
    period: Mapped[str] = mapped_column(nullable=False)
    base_date: Mapped[date] = mapped_column(nullable=False)

