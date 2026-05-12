"""所有 Pydantic 模型的基类 — 统一配 model_config。"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    """所有 request/response schema 继承此基类。"""

    model_config = ConfigDict(
        from_attributes=True,  # 支持从 ORM 对象构造
        str_strip_whitespace=True,
        populate_by_name=True,
    )


class TimestampedSchema(BaseSchema):
    """带时间戳的响应基类。"""

    created_at: datetime
    updated_at: datetime
