# db/init_db.py
from db.session import engine
from db.base import Base
from models.recipe import Recipe  # 모든 모델 import 필요!

Base.metadata.create_all(bind=engine)
