"""Todos 请求 / 响应 schema。"""

from pydantic import Field

from src.core.schemas import BaseSchema, TimestampedSchema


class TodoCreate(BaseSchema):
    text: str = Field(min_length=1, max_length=500)


class TodoUpdate(BaseSchema):
    text: str | None = Field(default=None, min_length=1, max_length=500)
    done: bool | None = None


class TodoResponse(TimestampedSchema):
    id: int
    user_id: int
    text: str
    done: bool


class TodoListResponse(BaseSchema):
    items: list[TodoResponse]
    total: int
