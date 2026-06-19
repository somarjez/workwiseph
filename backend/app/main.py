from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.routers import health, kpis, labor


def create_app() -> FastAPI:
    app = FastAPI(title="WorkWise PH API", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_methods=["GET"],
        allow_headers=["*"],
    )
    app.include_router(health.router, prefix="/api")
    app.include_router(kpis.router, prefix="/api")
    app.include_router(labor.router, prefix="/api")
    return app


app = create_app()
