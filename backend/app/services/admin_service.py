"""Admin user seeding/auth and ETL/forecast job execution with run logging."""
from __future__ import annotations
from datetime import datetime, timezone

from sqlalchemy import select, desc

from backend.app.core.config import settings
from backend.app.core.security import hash_password, verify_password
from backend.app.db.session import SessionLocal
from backend.app.db.models import User, EtlRunLog


def seed_admin() -> None:
    """Create the configured admin user if it does not already exist."""
    with SessionLocal() as db:
        exists = db.scalar(select(User).where(User.username == settings.admin_username))
        if not exists:
            db.add(User(username=settings.admin_username,
                        password_hash=hash_password(settings.admin_password)))
            db.commit()


def authenticate(username: str, password: str) -> bool:
    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.username == username))
    return bool(user) and verify_password(password, user.password_hash)


def user_exists(username: str) -> bool:
    with SessionLocal() as db:
        return db.scalar(select(User).where(User.username == username)) is not None


def start_log(job: str) -> int:
    with SessionLocal() as db:
        row = EtlRunLog(job=job, status="started")
        db.add(row)
        db.commit()
        return row.id


def finish_log(log_id: int, status: str, detail: str | None = None) -> None:
    with SessionLocal() as db:
        row = db.get(EtlRunLog, log_id)
        if row:
            row.status = status
            row.detail = (detail or "")[:2000]
            row.finished_at = datetime.now(timezone.utc)
            db.commit()


def list_logs(limit: int = 50) -> list[dict]:
    with SessionLocal() as db:
        rows = db.scalars(select(EtlRunLog).order_by(desc(EtlRunLog.id)).limit(limit)).all()
        return [{"id": r.id, "job": r.job, "status": r.status, "detail": r.detail,
                 "started_at": r.started_at.isoformat() if r.started_at else None,
                 "finished_at": r.finished_at.isoformat() if r.finished_at else None}
                for r in rows]


def _run(job: str, log_id: int, fn) -> None:
    try:
        result = fn()
        finish_log(log_id, "success", str(result))
    except Exception as exc:  # noqa: BLE001 - record any failure
        finish_log(log_id, "error", repr(exc))


def run_etl_job(log_id: int) -> None:
    from data_pipeline.scripts.run_etl import run_full_etl
    _run("etl", log_id, run_full_etl)


def run_forecast_job(log_id: int) -> None:
    from data_pipeline.forecast_pipeline import run_forecasts
    _run("forecast", log_id, run_forecasts)
