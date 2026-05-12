"""Auth 依赖项 — get_current_user 等。"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.models import User
from src.auth.security import decode_access_token
from src.auth.service import get_user_by_id
from src.core.db import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_error

    sub = payload.get("sub")
    if not sub:
        raise credentials_error

    try:
        user_id = int(sub)
    except (TypeError, ValueError):
        raise credentials_error from None

    user = await get_user_by_id(db, user_id)
    if user is None:
        raise credentials_error
    return user
