"""Auth 请求 / 响应 schema。"""

from datetime import datetime

from pydantic import EmailStr, Field

from src.core.schemas import BaseSchema


class RegisterRequest(BaseSchema):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: str | None = Field(default=None, max_length=100)


class LoginRequest(BaseSchema):
    email: EmailStr
    password: str


class TokenResponse(BaseSchema):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # 秒


class UserResponse(BaseSchema):
    id: int
    email: EmailStr
    display_name: str | None
    email_verified_at: datetime | None
    created_at: datetime
