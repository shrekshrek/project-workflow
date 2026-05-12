# syntax=docker/dockerfile:1.7
# scaffold-v2 backend Dockerfile
#
# uv 装包 + FastAPI async。开发时 docker-compose 把源码 mount 进来跑 --reload。
#
# 优化点(参考 nuxt 脚手架):
#   - BuildKit syntax: cache mount 加速重建
#   - UV_LINK_MODE=copy: 消除"hardlink failed, falling back to copy"警告
#   - PYTHONDONTWRITEBYTECODE / PYTHONUNBUFFERED: 容器内 .pyc 没意义,log 实时出
#   - 不装 apt 包: 所有 deps 都有 wheel(asyncpg 自带 PG 客户端,不需要 libpq-dev)

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_LINK_MODE=copy

WORKDIR /app

# uv 静态二进制(从官方镜像拷过来,不走 pip install)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# 先拷依赖文件,利用 docker layer cache
COPY pyproject.toml uv.lock* ./

# uv sync 用 cache mount 加速重建(BuildKit feature)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev 2>/dev/null || \
    uv sync --no-dev

# 拷源码(开发时被 volume mount 覆盖,生产时是这份)
COPY . .

EXPOSE 8000

# 默认启动(docker-compose 会覆盖,带 alembic upgrade)
CMD ["uv", "run", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
