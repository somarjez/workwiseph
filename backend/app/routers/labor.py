from fastapi import APIRouter, Query, HTTPException
from backend.app.services import labor_service
from backend.app.schemas.responses import Series

router = APIRouter(prefix="/labor", tags=["labor"])


@router.get("/rates", response_model=Series)
def rates(indicator: str = Query(...), sex: str = "Both Sexes"):
    return labor_service.get_series("raw.lfs_rates", indicator, sex)


@router.get("/levels", response_model=Series)
def levels(indicator: str = Query(...), sex: str = "Both Sexes"):
    return labor_service.get_series("raw.lfs_levels", indicator, sex)


@router.get("/age-sex")
def age_sex(source: str = Query(...), sex: str = "Both Sexes"):
    try:
        return labor_service.get_age_sex(source, sex)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"unknown source '{source}'")
