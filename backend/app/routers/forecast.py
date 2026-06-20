from fastapi import APIRouter, HTTPException
from backend.app.services import forecast_service

router = APIRouter(tags=["forecast"])


def _check_indicator(indicator: str):
    if indicator not in forecast_service.VALID:
        raise HTTPException(status_code=404, detail=f"unknown indicator '{indicator}'")


@router.get("/forecast")
def forecast(indicator: str = "Unemployment Rate", method: str = "ets"):
    _check_indicator(indicator)
    if method not in forecast_service.FORECAST_METHODS:
        raise HTTPException(status_code=400, detail=f"unknown method '{method}'")
    return forecast_service.forecast(indicator, method)


@router.get("/anomalies")
def anomalies(indicator: str = "Unemployment Rate", method: str = "zscore"):
    _check_indicator(indicator)
    if method not in forecast_service.ANOMALY_METHODS:
        raise HTTPException(status_code=400, detail=f"unknown method '{method}'")
    return forecast_service.anomalies(indicator, method)
