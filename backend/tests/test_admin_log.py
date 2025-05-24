# backend/tests/test_admin_log.py

from fastapi.testclient import TestClient

def test_admin_get_logs_with_pagination(admin_client: TestClient):
    res = admin_client.get("/api/admin/logs?limit=5&offset=0")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_admin_filter_logs_by_user(admin_client: TestClient):
    user_id = 1
    res = admin_client.get(f"/api/admin/logs?user_id={user_id}")
    assert res.status_code == 200
