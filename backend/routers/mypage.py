# backend/routers/mypage.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend import models, schemas
from backend.db import get_db
from backend.app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/mypage",
    tags=["Mypage"]
)

@router.get("/summary", response_model=schemas.MypageSummaryResponse)
def get_mypage_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 북마크 가져오기
    bookmarks = db.query(models.Bookmark).join(models.Recipe).filter(
        models.Bookmark.user_id == current_user.id
    ).all()

    # Detection 결과 가져오기
    detections = db.query(models.DetectionResult).join(models.Food).filter(
        models.DetectionResult.user_id == current_user.id
    ).order_by(models.DetectionResult.created_at.desc()).limit(5).all()

    # 리뷰 가져오기
    reviews = db.query(models.Review).join(models.Food).filter(
        models.Review.user_id == current_user.id
    ).all()

    return schemas.MypageSummaryResponse(
        bookmarks=[
            schemas.BookmarkSummary(
                id=bm.id,
                recipe_id=bm.recipe.id,
                recipe_title=bm.recipe.title,
                recipe_thumbnail=bm.recipe.food.image_url if bm.recipe.food else None
            )
            for bm in bookmarks
        ],
        detection_results=[
            schemas.DetectionResultSummary(
                id=det.id,
                food_name=det.food.name,
                image_path=det.image_path,
                confidence=det.confidence
            )
            for det in detections
        ],
        reviews=[
            schemas.ReviewSummary(
                id=rv.id,
                food_name=rv.food.name,
                content=rv.content,
                rating=rv.rating,
                food_image_url=rv.food.image_url if rv.food else None
            )
            for rv in reviews
        ]
    )
