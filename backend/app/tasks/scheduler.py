# backend/app/tasks/scheduler.py
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy import func
from backend.db import SessionLocal
from backend import models
from datetime import date, datetime, timedelta, timezone
import pytz

def delete_expired_refresh_tokens():
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        expired = db.query(models.RefreshToken).filter(models.RefreshToken.expires_at < now)
        count = expired.count()
        expired.delete()
        db.commit()
        print(f"[cron] Deleted {count} expired refresh tokens.")
    finally:
        db.close()

def calculate_search_ranking(period="day"):
    db = SessionLocal()
    try:
        today = date.today()

        if period == "day":
            start = datetime.combine(today - timedelta(days=1), datetime.min.time())
            end = datetime.combine(today, datetime.min.time())
        else:
            start = datetime.combine(today - timedelta(weeks=1), datetime.min.time())
            end = datetime.combine(today, datetime.min.time())

        result = (
            db.query(models.SearchLog.keyword, func.count(models.SearchLog.id).label("count"))
            .filter(models.SearchLog.created_at >= start, models.SearchLog.created_at < end)
            .group_by(models.SearchLog.keyword)
            .order_by(func.count(models.SearchLog.id).desc())
            .limit(10)
            .all()
        )

        for i, (keyword, count) in enumerate(result):
            db.add(models.SearchRanking(
                keyword=keyword,
                rank=i + 1,
                count=count,
                period=period,
                date=today
            ))

        db.commit()
        print(f"[cron] Recorded {period} search rankings.")
    finally:
        db.close()

def start_scheduler():
    scheduler = BackgroundScheduler(timezone=pytz.utc)
    
    scheduler.add_job(delete_expired_refresh_tokens, 'cron', hour=3, minute=0)

    # ✅ 테스트용 job (10초마다 실행) — 테스트 후 주석처리
    # scheduler.add_job(delete_expired_refresh_tokens, 'interval', seconds=10)

    scheduler.add_job(calculate_search_ranking, 'cron', hour=0, minute=0, kwargs={"period": "day"})
    scheduler.add_job(calculate_search_ranking, 'cron', day_of_week="mon", hour=1, minute=0, kwargs={"period": "week"})

    scheduler.start()
