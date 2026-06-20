from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, UploadFile, File
from pydantic import BaseModel

from backend.app.core.auth_deps import get_current_admin
from backend.app.core.rate_limit import limiter
from backend.app.core.security import create_token
from backend.app.services import admin_service
from backend.app.services.admin_service import UploadError

router = APIRouter(prefix="/admin", tags=["admin"])


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/15minute")
def login(request: Request, body: LoginRequest):
    if not admin_service.authenticate(body.username, body.password):
        raise HTTPException(status_code=401, detail="invalid credentials")
    return TokenResponse(access_token=create_token(body.username))


@router.post("/etl/run", status_code=202)
def run_etl(background: BackgroundTasks, admin: str = Depends(get_current_admin)):
    log_id = admin_service.start_log("etl")
    background.add_task(admin_service.run_etl_job, log_id)
    return {"job": "etl", "status": "started", "log_id": log_id}


@router.post("/forecast/run", status_code=202)
def run_forecast(background: BackgroundTasks, admin: str = Depends(get_current_admin)):
    log_id = admin_service.start_log("forecast")
    background.add_task(admin_service.run_forecast_job, log_id)
    return {"job": "forecast", "status": "started", "log_id": log_id}


@router.post("/upload")
@limiter.limit("5/minute")
async def upload(request: Request, file: UploadFile = File(...),
                 admin: str = Depends(get_current_admin)):
    content = await file.read()
    try:
        return admin_service.ingest_csv(file.filename or "upload.csv", content)
    except UploadError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc))


@router.get("/logs")
def logs(admin: str = Depends(get_current_admin)):
    return admin_service.list_logs()
