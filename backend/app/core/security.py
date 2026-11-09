from datetime import UTC, datetime, timedelta
from uuid import UUID

import jwt
from pwdlib import PasswordHash

from app.core.config import settings

password_hash = PasswordHash.recommended()
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    try:
        return password_hash.verify(password, hashed)
    except (ValueError, TypeError):
        return False


def create_access_token(subject: UUID, password_changed_at: datetime | None = None, expires_delta: timedelta | None = None) -> str:
    expiry = datetime.now(UTC) + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    return jwt.encode({"sub": str(subject), "pwd": password_changed_at.isoformat() if password_changed_at else None, "exp": expiry}, settings.secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str) -> UUID:
    payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    return UUID(payload["sub"])


def decode_access_claims(token: str) -> dict[str, object]:
    return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])


def create_password_reset_token(subject: UUID) -> str:
    expiry = datetime.now(UTC) + timedelta(minutes=settings.password_reset_expire_minutes)
    return jwt.encode({"sub": str(subject), "purpose": "password_reset", "iat": int(datetime.now(UTC).timestamp()), "exp": expiry}, settings.secret_key, algorithm=ALGORITHM)
