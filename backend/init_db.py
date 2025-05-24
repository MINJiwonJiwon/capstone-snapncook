# init_db.py

from db.base import Base
from db.session import engine
import models.food  # 모델 임포트 해야 Base.metadata에 반영됨

def init_db():
    Base.metadata.create_all(bind=engine)
    print("DB 테이블 생성 완료")

if __name__ == "__main__":
    init_db()
