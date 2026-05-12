"""Todos 业务逻辑 — 永远 scope 到当前 user_id,不允许跨用户读写。

service 层不依赖 FastAPI(可被 CLI / 后台任务等任意调用方复用),
HTTP 错误码由 router 层捕获 TodoNotFound 后转 HTTPException。
"""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.todos.models import Todo
from src.todos.schemas import TodoCreate, TodoUpdate


class TodoNotFound(Exception):
    """Todo 不存在 或 不属于当前用户(对外统一 404,不暴露存在性)。"""


async def list_todos(db: AsyncSession, user_id: int) -> tuple[list[Todo], int]:
    query = select(Todo).where(Todo.user_id == user_id).order_by(Todo.created_at.desc())
    result = await db.execute(query)
    items = list(result.scalars().all())

    count_query = select(func.count(Todo.id)).where(Todo.user_id == user_id)
    total = (await db.execute(count_query)).scalar_one()
    return items, total


async def create_todo(db: AsyncSession, user_id: int, payload: TodoCreate) -> Todo:
    todo = Todo(user_id=user_id, text=payload.text, done=False)
    db.add(todo)
    await db.commit()
    await db.refresh(todo)
    return todo


async def _get_owned_todo(db: AsyncSession, user_id: int, todo_id: int) -> Todo:
    query = select(Todo).where(Todo.id == todo_id, Todo.user_id == user_id)
    todo = (await db.execute(query)).scalar_one_or_none()
    if todo is None:
        raise TodoNotFound
    return todo


async def update_todo(
    db: AsyncSession, user_id: int, todo_id: int, payload: TodoUpdate
) -> Todo:
    todo = await _get_owned_todo(db, user_id, todo_id)
    if payload.text is not None:
        todo.text = payload.text
    if payload.done is not None:
        todo.done = payload.done
    await db.commit()
    await db.refresh(todo)
    return todo


async def delete_todo(db: AsyncSession, user_id: int, todo_id: int) -> None:
    todo = await _get_owned_todo(db, user_id, todo_id)
    await db.delete(todo)
    await db.commit()
