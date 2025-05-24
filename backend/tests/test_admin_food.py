# backend/tests/test_admmin_food.py

from fastapi.testclient import TestClient

def test_admin_get_foods(admin_client: TestClient):
    res = admin_client.get("/api/admin/foods")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_admin_update_food(admin_client: TestClient):
    food_id = 1
    res = admin_client.put(f"/api/admin/foods/{food_id}", json={"name": "UpdatedFood"})
    assert res.status_code in [200, 404]

def test_admin_delete_food(admin_client: TestClient):
    food_id = 1
    res = admin_client.delete(f"/api/admin/foods/{food_id}")
    assert res.status_code in [204, 404]
