# backend/tests/test_admin_review.py

import pytest

def test_admin_get_reviews(admin_client):
    res = admin_client.get("/admin/reviews")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_admin_delete_review(admin_client):
    review_id = 1
    res = admin_client.delete(f"/admin/reviews/{review_id}")
    assert res.status_code in [204, 404]
