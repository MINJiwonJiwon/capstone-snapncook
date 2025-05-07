# backend/tests/test_admin_user.py

import pytest

def test_admin_get_users(admin_client):
    res = admin_client.get("/admin/users")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_admin_update_user(admin_client):
    user_id = 1
    res = admin_client.put(f"/admin/users/{user_id}", json={"nickname": "UpdatedName"})
    assert res.status_code in [200, 404]

def test_admin_delete_user(admin_client):
    user_id = 1
    res = admin_client.delete(f"/admin/users/{user_id}")
    assert res.status_code in [204, 404]
