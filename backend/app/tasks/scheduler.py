# backend/app/tasks/scheduler.py
from apscheduler.schedulers.background import BackgroundScheduler
from backend.db import SessionLocal
from backend import models
from datetime import datetime, timezone
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

def start_scheduler():
    scheduler = BackgroundScheduler(timezone=pytz.utc)
    scheduler.add_job(delete_expired_refresh_tokens, 'cron', hour=3, minute=0)

    # ✅ 테스트용 job (10초마다 실행) — 테스트 후 주석처리
    # scheduler.add_job(delete_expired_refresh_tokens, 'interval', seconds=10)

    scheduler.start()
