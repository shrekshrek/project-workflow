"""User ORM 模型。

email_verified_at 字段已留位但暂不强制 —— Tier 2 邮件验证 feature 见
docs/proposals/email-verification.md。
"""

from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from src.core.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(60), nullable=False)  # bcrypt 固定 60
    display_name: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Tier 2 留位:验证邮箱后填值;第一版默认 null,不阻塞登录
    email_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
