# backend/tests/test_admin_user.py

from fastapi.testclient import TestClient

def test_admin_get_users(admin_client: TestClient):
    res = admin_client.get("/api/admin/users")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_admin_update_user(admin_client: TestClient):
    user_id = 1
    res = admin_client.put(f"/api/admin/users/{user_id}", json={"nickname": "UpdatedName"})
    assert res.status_code in [200, 404]

def test_admin_delete_user(admin_client: TestClient):
    user_id = 1
    res = admin_client.delete(f"/api/admin/users/{user_id}")
    assert res.status_code in [204, 404]
