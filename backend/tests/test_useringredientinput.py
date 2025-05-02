# backend/tests/test_useringredientinput.py

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_create_user_ingredient_input(authenticated_headers):
    input_data = {
        "input_text": "김치, 돼지고기, 마늘"
    }
    res = client.post("/user-ingredient-inputs/", json=input_data, headers=authenticated_headers)
    assert res.status_code == 200
    assert "id" in res.json()

def test_get_user_ingredient_input(authenticated_headers):
    input_data = {
        "input_text": "김치, 돼지고기, 마늘"
    }
    create_res = client.post("/user-ingredient-inputs/", json=input_data, headers=authenticated_headers)
    assert create_res.status_code == 200
    input_id = create_res.json()["id"]

    res = client.get(f"/user-ingredient-inputs/{input_id}", headers=authenticated_headers)
    assert res.status_code == 200
    assert res.json()["id"] == input_id
