# backend/tests/test_admin_log.py

import pytest

def test_admin_get_logs_with_pagination(admin_client):
    res = admin_client.get("/admin/logs?limit=5&offset=0")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_admin_filter_logs_by_user(admin_client):
    user_id = 1
    res = admin_client.get(f"/admin/logs?user_id={user_id}")
    assert res.status_code == 200
