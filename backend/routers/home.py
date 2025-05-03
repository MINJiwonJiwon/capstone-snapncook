from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta
from backend import models, schemas, crud
from backend.db import get_db

router = APIRouter(
    prefix="/api",
    tags=["Home"]
)

# 인기 검색어 랭킹 API
@router.get("/popular-searches", response_model=schemas.PopularSearchResponse)
def get_popular_searches(
    period: str = Query("day", enum=["day", "week"]),
    db: Session = Depends(get_db)
):
    today = date.today()
    prev_date = today - (timedelta(days=1) if period == "day" else timedelta(weeks=1))

    today_rankings = crud.get_search_rankings(db, period=period, on_date=today)
    prev_rank_dict = crud.get_previous_rankings_dict(db, period=period, on_date=prev_date)

    rankings = []
    for r in today_rankings:
        prev_rank = prev_rank_dict.get(r.keyword)
        if prev_rank is None:
            trend = "new"
        elif prev_rank > r.rank:
            trend = "up"
        elif prev_rank < r.rank:
            trend = "down"
        else:
            trend = "same"

        rankings.append({
            "rank": r.rank,
            "keyword": r.keyword,
            "previous_rank": prev_rank,
            "trend": trend
        })

    return {
        "period": period,
        "rankings": rankings
    }

# 오늘의 추천 메뉴 API
@router.get("/recommended-food", response_model=schemas.TodayRecommendedFoodResponse)
def get_recommended_food(db: Session = Depends(get_db)):
    food = crud.get_random_food(db)
    if not food:
        raise HTTPException(status_code=404, detail="No food found")

    avg_rating = crud.get_average_rating_for_food(db, food.id)

    return {
        "date": date.today().isoformat(),
        "food": {
            "id": food.id,
            "name": food.name,
            "description": food.description,
            "image_url": food.image_url,
            "rating": avg_rating,
            "reason": "오늘의 추천 메뉴로 즐겨보세요!"
        }
    }
