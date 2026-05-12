"""Todos 端点测试 — 覆盖 CRUD + 跨用户隔离 + 401。"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_empty(client: AsyncClient, auth_headers: dict):
    r = await client.get("/api/v1/todos", headers=auth_headers)
    assert r.status_code == 200
    body = r.json()
    assert body["items"] == []
    assert body["total"] == 0


@pytest.mark.asyncio
async def test_create_todo(client: AsyncClient, auth_headers: dict):
    r = await client.post(
        "/api/v1/todos",
        json={"text": "buy milk"},
        headers=auth_headers,
    )
    assert r.status_code == 201
    body = r.json()
    assert body["text"] == "buy milk"
    assert body["done"] is False
    assert body["id"] > 0


@pytest.mark.asyncio
async def test_list_after_create(client: AsyncClient, auth_headers: dict):
    await client.post("/api/v1/todos", json={"text": "task A"}, headers=auth_headers)
    await client.post("/api/v1/todos", json={"text": "task B"}, headers=auth_headers)
    r = await client.get("/api/v1/todos", headers=auth_headers)
    assert r.status_code == 200
    body = r.json()
    assert body["total"] == 2
    texts = {item["text"] for item in body["items"]}
    assert texts == {"task A", "task B"}


@pytest.mark.asyncio
async def test_update_todo_done(client: AsyncClient, auth_headers: dict):
    created = await client.post(
        "/api/v1/todos", json={"text": "to update"}, headers=auth_headers
    )
    todo_id = created.json()["id"]
    r = await client.patch(
        f"/api/v1/todos/{todo_id}",
        json={"done": True},
        headers=auth_headers,
    )
    assert r.status_code == 200
    assert r.json()["done"] is True


@pytest.mark.asyncio
async def test_delete_todo(client: AsyncClient, auth_headers: dict):
    created = await client.post(
        "/api/v1/todos", json={"text": "to delete"}, headers=auth_headers
    )
    todo_id = created.json()["id"]
    r = await client.delete(f"/api/v1/todos/{todo_id}", headers=auth_headers)
    assert r.status_code == 204

    listing = await client.get("/api/v1/todos", headers=auth_headers)
    assert listing.json()["total"] == 0


@pytest.mark.asyncio
async def test_update_not_found(client: AsyncClient, auth_headers: dict):
    r = await client.patch(
        "/api/v1/todos/99999",
        json={"done": True},
        headers=auth_headers,
    )
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_delete_not_found(client: AsyncClient, auth_headers: dict):
    r = await client.delete("/api/v1/todos/99999", headers=auth_headers)
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_create_requires_auth(client: AsyncClient):
    r = await client.post("/api/v1/todos", json={"text": "no auth"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_empty_text_rejected(client: AsyncClient, auth_headers: dict):
    r = await client.post("/api/v1/todos", json={"text": ""}, headers=auth_headers)
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_cross_user_isolation(client: AsyncClient, auth_headers: dict):
    # 第一个用户(auth_headers fixture 里的 test@example.com)创建一条
    created = await client.post(
        "/api/v1/todos", json={"text": "user 1 todo"}, headers=auth_headers
    )
    todo_id = created.json()["id"]

    # 注册并登录第二个用户
    await client.post(
        "/api/v1/auth/register",
        json={"email": "second@example.com", "password": "password123"},
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "second@example.com", "password": "password123"},
    )
    second_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    # 第二个用户列表为空
    r = await client.get("/api/v1/todos", headers=second_headers)
    assert r.json()["total"] == 0

    # 第二个用户改不动第一个的 todo(404 不暴露存在性)
    r = await client.patch(
        f"/api/v1/todos/{todo_id}",
        json={"done": True},
        headers=second_headers,
    )
    assert r.status_code == 404
