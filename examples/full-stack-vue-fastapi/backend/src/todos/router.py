"""Todos API 端点 — 全部要 auth,scope 到当前 user。"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.deps import get_current_user
from src.auth.models import User
from src.core.db import get_db
from src.todos.schemas import (
    TodoCreate,
    TodoListResponse,
    TodoResponse,
    TodoUpdate,
)
from src.todos.service import (
    TodoNotFound,
    create_todo,
    delete_todo,
    list_todos,
    update_todo,
)

router = APIRouter()


def _todo_not_found() -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="todo not found")


@router.get(
    "",
    response_model=TodoListResponse,
    status_code=status.HTTP_200_OK,
    summary="列出当前用户的所有 TODO",
)
async def list_endpoint(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TodoListResponse:
    items, total = await list_todos(db, user.id)
    return TodoListResponse(
        items=[TodoResponse.model_validate(t) for t in items],
        total=total,
    )


@router.post(
    "",
    response_model=TodoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="创建 TODO",
)
async def create_endpoint(
    payload: TodoCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TodoResponse:
    todo = await create_todo(db, user.id, payload)
    return TodoResponse.model_validate(todo)


@router.patch(
    "/{todo_id}",
    response_model=TodoResponse,
    status_code=status.HTTP_200_OK,
    summary="更新 TODO(文本 / done)",
)
async def update_endpoint(
    todo_id: int,
    payload: TodoUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TodoResponse:
    try:
        todo = await update_todo(db, user.id, todo_id, payload)
    except TodoNotFound as exc:
        raise _todo_not_found() from exc
    return TodoResponse.model_validate(todo)


@router.delete(
    "/{todo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="删除 TODO",
)
async def delete_endpoint(
    todo_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    try:
        await delete_todo(db, user.id, todo_id)
    except TodoNotFound as exc:
        raise _todo_not_found() from exc
