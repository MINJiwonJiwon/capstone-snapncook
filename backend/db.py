from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os
from fastapi import Depends

load_dotenv()

# 환경 변수에서 데이터베이스 연결 정보 읽기
DB_USER = os.getenv("POSTGRES_USER")
DB_PASS = os.getenv("POSTGRES_PASSWORD")
DB_NAME = os.getenv("POSTGRES_DB")
DB_HOST = os.getenv("POSTGRES_HOST")
DB_PORT = os.getenv("POSTGRES_PORT")

# 데이터베이스 URL 생성
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# 엔진 생성
engine = create_engine(DATABASE_URL)

# 세션 로컬 설정
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 모델의 베이스 클래스
Base = declarative_base()

# 데이터베이스 세션 의존성 함수
def get_db():
    db = SessionLocal()  # 세션 생성
    try:
        yield db  # DB 세션을 라우터 함수에 의존성으로 전달
    finally:
        db.close()  # 요청 후 DB 세션 닫기
