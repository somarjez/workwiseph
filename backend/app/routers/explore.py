from fastapi import APIRouter, Query
from backend.app.services import explore_service

router = APIRouter(prefix="/explore", tags=["explore"])


@router.get("/options")
def options():
    return explore_service.options()


@router.get("/series")
def series(
    source: str = Query(...),
    indicator: str | None = None,
    sex: str | None = None,
    age_group: str | None = None,
    category: str | None = None,
    period_type: str = "monthly",
):
    return explore_service.series(source, indicator, sex, age_group, category, period_type)
