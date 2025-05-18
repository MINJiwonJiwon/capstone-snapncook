# backend/tests/test_admin_review.py

from fastapi.testclient import TestClient

def test_admin_get_reviews(admin_client: TestClient):
    res = admin_client.get("/api/admin/reviews")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_admin_delete_review(admin_client: TestClient):
    review_id = 1
    res = admin_client.delete(f"/api/admin/reviews/{review_id}")
    assert res.status_code in [204, 404]
