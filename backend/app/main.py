from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from backend.app.core.config import settings
from backend.app.core.rate_limit import limiter
from backend.app.routers import (
    health, kpis, labor, underemployment, sectors, education, workforce, forecast, admin)
from backend.app.services import admin_service


def create_app() -> FastAPI:
    app = FastAPI(title="WorkWise PH API", version="0.1.0")
    if settings.rate_limit_enabled:
        app.state.limiter = limiter
        app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_methods=["GET"],
        allow_headers=["*"],
    )
    app.include_router(health.router, prefix="/api")
    app.include_router(kpis.router, prefix="/api")
    app.include_router(labor.router, prefix="/api")
    app.include_router(underemployment.router, prefix="/api")
    app.include_router(sectors.router, prefix="/api")
    app.include_router(education.router, prefix="/api")
    app.include_router(workforce.router, prefix="/api")
    app.include_router(forecast.router, prefix="/api")
    app.include_router(admin.router, prefix="/api")

    # Seed the admin user. Guarded so the app still boots if the DB is unreachable.
    try:
        admin_service.seed_admin()
    except Exception:  # noqa: BLE001
        pass

    return app


app = create_app()
