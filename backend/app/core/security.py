"""Password hashing (stdlib pbkdf2) and JWT helpers for admin auth."""
from __future__ import annotations
import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone

import jwt

from backend.app.core.config import settings

_ALGO = "sha256"
_ITERATIONS = 200_000
_JWT_ALG = "HS256"
TOKEN_TTL_MINUTES = 720  # 12h


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac(_ALGO, password.encode(), salt, _ITERATIONS)
    return f"pbkdf2_{_ALGO}${_ITERATIONS}${salt.hex()}${dk.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, iterations, salt_hex, hash_hex = stored.split("$")
        dk = hashlib.pbkdf2_hmac(_ALGO, password.encode(),
                                 bytes.fromhex(salt_hex), int(iterations))
        return hmac.compare_digest(dk.hex(), hash_hex)
    except (ValueError, AttributeError):
        return False


def create_token(subject: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {"sub": subject, "iat": now,
               "exp": now + timedelta(minutes=TOKEN_TTL_MINUTES)}
    return jwt.encode(payload, settings.secret_key, algorithm=_JWT_ALG)


def decode_token(token: str) -> str | None:
    """Return the subject if valid, else None."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[_JWT_ALG])
        return payload.get("sub")
    except jwt.PyJWTError:
        return None
