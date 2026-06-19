from backend.app.repositories import labor_repository as repo
from backend.app.schemas.responses import Series, Point, Kpi
from data_pipeline.config import TABLE_REGISTRY

_SOURCE_BY_KEY = {t.key: t.source_table for t in TABLE_REGISTRY}


def source_table_for(key: str) -> str:
    if key not in _SOURCE_BY_KEY:
        raise KeyError(key)
    return _SOURCE_BY_KEY[key]


def get_series(source_table, indicator, sex, period_type="monthly") -> Series:
    rows = repo.fetch_series(source_table, indicator, sex, period_type)
    return Series(indicator=indicator or "", sex=sex, period=period_type.title(),
                  data=[Point(**r) for r in rows])


def get_kpis() -> list[Kpi]:
    return [Kpi(**r) for r in repo.fetch_kpis()]


def get_age_sex(key, sex, period_type="monthly") -> dict:
    rows = repo.fetch_age_sex(source_table_for(key), sex, period_type)
    return {"source": key, "data": rows}
