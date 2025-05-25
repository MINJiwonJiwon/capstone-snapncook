from fastapi import FastAPI
from dotenv import load_dotenv
import logging

from routers import recipe, review, food, user 

# 환경 변수 로드
load_dotenv()

# FastAPI 앱 생성 및 로깅 설정
app = FastAPI()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 라우터 등록
app.include_router(recipe.router)
app.include_router(review.router)
app.include_router(food.router)
app.include_router(user.router)
