"""应用配置 — 全部走环境变量,pydantic-settings 解析校验。"""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    APP_NAME: str = "scaffold-v2-backend"
    VERSION: str = "0.1.0"
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://app:app_dev_password@localhost:5432/app"
    )

    JWT_SECRET: str = Field(default="dev_only_change_in_prod_must_be_random_32_chars_or_more")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    BCRYPT_ROUNDS: int = 4  # 开发快,生产 env 覆盖到 12+

    CORS_ORIGINS: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
