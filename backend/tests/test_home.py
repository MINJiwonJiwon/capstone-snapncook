# backend/tests/test_home.py

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

# 인기 검색어 랭킹 API 테스트
def test_get_popular_searches():
    response = client.get("/api/popular-searches?period=day")
    assert response.status_code == 200

    data = response.json()
    assert "period" in data
    assert "rankings" in data
    assert isinstance(data["rankings"], list)

    for item in data["rankings"]:
        assert "rank" in item
        assert "keyword" in item
        assert "trend" in item

# 오늘의 추천 메뉴 API 테스트
def test_get_recommended_food():
    response = client.get("/api/recommended-food")
    assert response.status_code == 200

    data = response.json()
    assert "date" in data
    assert "food" in data

    food = data["food"]
    assert "id" in food
    assert "name" in food
    assert "rating" in food
    assert isinstance(food["rating"], float)
