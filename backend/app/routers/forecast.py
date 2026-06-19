from fastapi import APIRouter, HTTPException
from backend.app.services import forecast_service

router = APIRouter(tags=["forecast"])


def _check(indicator: str):
    if indicator not in forecast_service.VALID:
        raise HTTPException(status_code=404, detail=f"unknown indicator '{indicator}'")


@router.get("/forecast")
def forecast(indicator: str = "Unemployment Rate"):
    _check(indicator)
    return forecast_service.forecast(indicator)


@router.get("/anomalies")
def anomalies(indicator: str = "Unemployment Rate"):
    _check(indicator)
    return forecast_service.anomalies(indicator)
