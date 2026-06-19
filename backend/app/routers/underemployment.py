from fastapi import APIRouter
from backend.app.services import labor_service
from backend.app.repositories import labor_repository as repo

router = APIRouter(prefix="/underemployment", tags=["underemployment"])


@router.get("/summary")
def summary(sex: str = "Both Sexes"):
    rate = labor_service.get_series("raw.lfs_rates", "Underemployment Rate", sex)
    by_age = labor_service.get_age_sex("underemployed", sex)
    return {"rate": rate, "by_age": by_age}


@router.get("/visible-invisible")
def visible_invisible(sex: str = "Both Sexes"):
    visible = repo.fetch_series(
        "raw.visible_underemployed_age_sex", None, sex, "monthly", "Total")
    invisible = repo.fetch_series(
        "raw.invisible_underemployed_age_sex", None, sex, "monthly", "Total")
    return {"visible": visible, "invisible": invisible}
