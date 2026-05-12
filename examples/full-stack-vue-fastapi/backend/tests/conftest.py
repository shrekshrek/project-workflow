"""共享 fixture — 测试 DB(独立 schema)+ 每测试 TRUNCATE + httpx AsyncClient。

架构(踩过的坑都在注释里):
  - session 级:`test_engine` + `session_factory` —— 整个测试会话一份
    (不存在的 test DB 自动建,schema 用 drop_all+create_all)
  - 测试级 autouse:`_truncate_tables` —— 每测试前清空所有表
    (比"事务 rollback + 共享 session"更稳:避免 asyncpg "另一操作进行中"错)
  - 测试级:`client` —— 覆盖 get_db 让 **每个请求拿独立 session**(贴近生产)
  - 测试级:`auth_headers` —— 注册 + 登录测试用户,返回 Bearer header

跑测试前提:`pnpm dev` 已起,docker compose 里 postgres 健康。
"""

from collections.abc import AsyncGenerator

import asyncpg
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.engine.url import URL, make_url
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from src.core.config import get_settings
from src.core.db import Base, get_db
from src.main import app


async def _ensure_test_database(url: URL, test_db_name: str) -> None:
    """连默认 `postgres` 库,test DB 不存在就建。"""
    admin = await asyncpg.connect(
        user=url.username,
        password=url.password,
        host=url.host,
        port=url.port,
        database="postgres",
    )
    try:
        exists = await admin.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = $1", test_db_name
        )
        if not exists:
            # CREATE DATABASE 不允许参数化绑定,db 名走双引号 quote
            await admin.execute(f'CREATE DATABASE "{test_db_name}"')
    finally:
        await admin.close()


@pytest_asyncio.fixture(scope="session")
async def test_engine():
    settings = get_settings()
    base_url = make_url(settings.DATABASE_URL)
    test_db_name = f"{base_url.database}_test"  # app -> app_test

    await _ensure_test_database(base_url, test_db_name)

    # NullPool: 每次 connect() 都开新连接,不在 pool 里跨 loop 共享 asyncpg Future。
    # 解决 "Future attached to a different loop" 错(session 级 engine + 函数级 test loop 必踩坑)
    engine = create_async_engine(
        base_url.set(database=test_db_name),
        echo=False,
        future=True,
        poolclass=NullPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture(scope="session")
async def session_factory(test_engine):
    return async_sessionmaker(bind=test_engine, expire_on_commit=False, autoflush=False)


@pytest_asyncio.fixture(autouse=True)
async def _truncate_tables(session_factory):
    """每测试前清空所有表 —— autouse,不用测试显式 require。"""
    async with session_factory() as session:
        # 按依赖关系倒序 truncate;RESTART IDENTITY 重置自增 id;CASCADE 处理外键
        tables = ", ".join(f'"{t.name}"' for t in reversed(Base.metadata.sorted_tables))
        if tables:
            await session.execute(text(f"TRUNCATE TABLE {tables} RESTART IDENTITY CASCADE"))
            await session.commit()


@pytest_asyncio.fixture
async def client(session_factory) -> AsyncGenerator[AsyncClient, None]:
    """覆盖 get_db,让每个请求拿独立 session(贴近生产)。"""

    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient) -> dict[str, str]:
    """注册 + 登录测试用户,返回 Authorization header。"""
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpassword123",
            "display_name": "Test User",
        },
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword123"},
    )
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
