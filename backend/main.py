from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from backend.db import SessionLocal   # 경로 수정

app = FastAPI()

# DB 세션 의존성 주입
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root(db: Session = Depends(get_db)):
    return {"message": "DB 연결 테스트 성공!"}
