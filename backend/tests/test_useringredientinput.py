# backend/tests/test_useringredientinput.py

from typing import Dict
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_create_user_ingredient_input(authenticated_headers: Dict[str, str]):
    input_data = {
        "input_text": "김치, 돼지고기, 마늘"
    }
    res = client.post("/api/user-ingredient-inputs/", json=input_data, headers=authenticated_headers)
    assert res.status_code == 200
    assert "id" in res.json()

def test_get_user_ingredient_input(authenticated_headers: Dict[str, str]):
    input_data = {
        "input_text": "김치, 돼지고기, 마늘"
    }
    create_res = client.post("/api/user-ingredient-inputs/", json=input_data, headers=authenticated_headers)
    assert create_res.status_code == 200
    input_id = create_res.json()["id"]

    res = client.get(f"/api/user-ingredient-inputs/{input_id}", headers=authenticated_headers)
    assert res.status_code == 200
    assert res.json()["id"] == input_id
