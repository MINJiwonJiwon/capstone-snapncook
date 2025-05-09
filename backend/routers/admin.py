# backend/routers/admin.py

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend import models, schemas
from backend.db import get_db
from backend.app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

# ------------------------
# ✅ 공통: 관리자 권한 검사
# ------------------------
def require_admin(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="관리자 권한이 필요합니다.")
    return current_user


# ------------------------
# 👤 유저 관리
# ------------------------

@router.get("/users", response_model=List[schemas.UserOut])
def get_all_users(db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    return db.query(models.User).all()

@router.get("/users/{user_id}", response_model=schemas.UserOut)
def get_user_by_id(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.query(models.RefreshToken).filter(models.RefreshToken.user_id == user.id).delete()
    db.delete(user)
    db.commit()
    return

@router.put("/users/{user_id}", response_model=schemas.UserOut, summary="유저 정보 수정")
def update_user(
    user_id: int,
    update_data: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if update_data.nickname is not None:
        user.nickname = update_data.nickname
    if update_data.is_admin is not None:
        user.is_admin = update_data.is_admin

    db.commit()
    db.refresh(user)
    return user

@router.get("/users", response_model=List[schemas.UserOut], summary="유저 목록 필터 조회")
def get_users_with_filters(
    email: Optional[str] = Query(None),
    nickname: Optional[str] = Query(None),
    is_admin: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    query = db.query(models.User)

    if email:
        query = query.filter(models.User.email.ilike(f"%{email}%"))
    if nickname:
        query = query.filter(models.User.nickname.ilike(f"%{nickname}%"))
    if is_admin is not None:
        query = query.filter(models.User.is_admin == is_admin)

    return query.all()


# ------------------------
# 🍽 음식 관리
# ------------------------

@router.get("/foods", response_model=List[schemas.FoodOut])
def get_all_foods(db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    return db.query(models.Food).all()

@router.delete("/foods/{food_id}", status_code=204)
def delete_food(food_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    food = db.query(models.Food).filter(models.Food.id == food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    db.delete(food)
    db.commit()
    return

@router.put("/foods/{food_id}", response_model=schemas.FoodOut, summary="음식 정보 수정")
def update_food(
    food_id: int,
    update_data: schemas.FoodUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    food = db.query(models.Food).filter(models.Food.id == food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")

    if update_data.name is not None:
        food.name = update_data.name
    if update_data.description is not None:
        food.description = update_data.description
    if update_data.image_url is not None:
        food.image_url = update_data.image_url

    db.commit()
    db.refresh(food)
    return food


# ------------------------
# 📋 레시피 관리
# ------------------------

@router.get("/recipes", response_model=List[schemas.RecipeOut])
def get_all_recipes(db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    return db.query(models.Recipe).all()

@router.delete("/recipes/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    db.delete(recipe)
    db.commit()
    return


@router.put("/recipes/{recipe_id}", response_model=schemas.RecipeOut, summary="레시피 정보 수정")
def update_recipe(
    recipe_id: int,
    update_data: schemas.RecipeUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    if update_data.title is not None:
        recipe.title = update_data.title
    if update_data.ingredients is not None:
        recipe.ingredients = update_data.ingredients
    if update_data.instructions is not None:
        recipe.instructions = update_data.instructions
    if update_data.source_detail is not None:
        recipe.source_detail = update_data.source_detail

    db.commit()
    db.refresh(recipe)
    return recipe

@router.get("/recipes", response_model=List[schemas.RecipeOut], summary="레시피 목록 필터 조회")
def get_recipes_with_filters(
    title: Optional[str] = Query(None),
    food_id: Optional[int] = Query(None),
    source_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    query = db.query(models.Recipe)

    if title:
        query = query.filter(models.Recipe.title.ilike(f"%{title}%"))
    if food_id:
        query = query.filter(models.Recipe.food_id == food_id)
    if source_type:
        query = query.filter(models.Recipe.source_type == source_type)

    return query.all()


# ------------------------
# 📝 리뷰 관리
# ------------------------

@router.get("/reviews", response_model=List[schemas.ReviewOut])
def get_all_reviews(db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    return db.query(models.Review).all()

@router.delete("/reviews/{review_id}", status_code=204)
def delete_review(review_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
    return

@router.get("/reviews", response_model=List[schemas.ReviewOut], summary="리뷰 목록 필터 조회")
def get_reviews_with_filters(
    user_id: Optional[int] = Query(None),
    food_id: Optional[int] = Query(None),
    rating: Optional[int] = Query(None),
    keyword: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    query = db.query(models.Review)

    if user_id:
        query = query.filter(models.Review.user_id == user_id)
    if food_id:
        query = query.filter(models.Review.food_id == food_id)
    if rating:
        query = query.filter(models.Review.rating == rating)
    if keyword:
        query = query.filter(models.Review.content.ilike(f"%{keyword}%"))

    return query.all()


# ------------------------
# 📊 유저 로그 관리
# ------------------------

@router.get("/logs", response_model=List[schemas.UserLogOut])
def get_all_user_logs(db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    return db.query(models.UserLog).order_by(models.UserLog.created_at.desc()).all()

@router.get("/logs/user/{user_id}", response_model=List[schemas.UserLogOut])
def get_logs_by_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    return db.query(models.UserLog).filter(models.UserLog.user_id == user_id).order_by(models.UserLog.created_at.desc()).all()

@router.get("/logs", response_model=List[schemas.UserLogOut], summary="유저 로그 목록 필터 + 페이징")
def get_logs_with_filters(
    user_id: Optional[int] = Query(None),
    action: Optional[str] = Query(None),
    target_type: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    query = db.query(models.UserLog)

    if user_id:
        query = query.filter(models.UserLog.user_id == user_id)
    if action:
        query = query.filter(models.UserLog.action == action)
    if target_type:
        query = query.filter(models.UserLog.target_type == target_type)

    logs = query.order_by(models.UserLog.created_at.desc()).offset(offset).limit(limit).all()
    return logs


# ------------------------
# 관리자 대시보드
# ------------------------

@router.get("/dashboard", summary="관리자 대시보드 요약", response_model=dict)
def get_admin_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    # 총 개수
    user_count = db.query(models.User).count()
    food_count = db.query(models.Food).count()
    recipe_count = db.query(models.Recipe).count()
    review_count = db.query(models.Review).count()
    detection_count = db.query(models.DetectionResult).count()

    # 오늘 생성된 유저 수
    today = datetime.now(timezone.utc).date()
    today_user_count = db.query(models.User).filter(models.User.created_at >= today).count()

    return {
        "user_count": user_count,
        "food_count": food_count,
        "recipe_count": recipe_count,
        "review_count": review_count,
        "detection_result_count": detection_count,
        "new_users_today": today_user_count,
    }
