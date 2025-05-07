# backend/tests/test_admin_recipe.py

import pytest

def test_admin_get_recipes(admin_client):
    res = admin_client.get("/admin/recipes")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_admin_update_recipe(admin_client):
    recipe_id = 1
    res = admin_client.put(f"/admin/recipes/{recipe_id}", json={"title": "Updated Recipe"})
    assert res.status_code in [200, 404]

def test_admin_delete_recipe(admin_client):
    recipe_id = 1
    res = admin_client.delete(f"/admin/recipes/{recipe_id}")
    assert res.status_code in [204, 404]
