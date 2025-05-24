# models/recipe.py
from sqlalchemy import Column, Integer, String, Text
from db.base import Base  # db/base.py에서 Base import하는 방식

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    summary = Column(Text, nullable=True)
    ingredients = Column(Text, nullable=True)  # JSON 문자열로 저장
    steps = Column(Text, nullable=True)        # JSON 문자열로 저장
    image_url = Column(String(255), nullable=True)
    tags = Column(String(255), nullable=True)
