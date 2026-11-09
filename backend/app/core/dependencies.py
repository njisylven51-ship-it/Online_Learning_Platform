from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import decode_access_claims, decode_access_token
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)
SessionDep = Annotated[Session, Depends(get_session)]


def get_current_user(credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)], session: SessionDep) -> User:
    unauthorized = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired credentials", headers={"WWW-Authenticate": "Bearer"})
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise unauthorized
    token = credentials.credentials
    try:
        user_id = decode_access_token(token)
    except (jwt.PyJWTError, ValueError, KeyError):
        raise unauthorized from None
    user = session.get(User, user_id)
    if not user or not user.is_active:
        raise unauthorized
    claims = decode_access_claims(token)
    token_password_version = claims.get("pwd")
    current_password_version = user.password_changed_at.isoformat() if user.password_changed_at else None
    if token_password_version != current_password_version:
        raise unauthorized
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
