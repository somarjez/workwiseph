# WorkWise PH — Backend API Implementation Plan (Plan B of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Expose the V1 dashboard data from NeonDB through a layered FastAPI service (health, KPIs, labor rates/levels/age-sex, underemployment summary + visible/invisible).

**Architecture:** Layered per spec §6 — `core` (config, CORS, rate limit), `db` (existing), `repositories` (parameterized SQL against `clean.fact_long` + `analytics.*`), `services` (shape rows into response models), `routers` (FastAPI endpoints), `schemas` (Pydantic). Read-only.

**Tech Stack:** FastAPI, Pydantic v2, pydantic-settings, slowapi, SQLAlchemy (existing engine), pytest + httpx TestClient.

## Global Constraints

- All endpoints under `/api`. CORS restricted to `CORS_ORIGINS` env (default `http://localhost:3000`).
- Parameterized SQL only (SQLAlchemy `text()` with bound params).
- Read from `clean.fact_long` (filter by `source_table`/`indicator_name`/`sex`/`age_group`/`period_type`) and `analytics.dashboard_kpis`/`analytics.monthly_labor_summary`.
- `source_table` values: rates=`raw.lfs_rates`, levels=`raw.lfs_levels`; age-sex sources per the registry.
- Default queries return `sex='Both Sexes'`, `period_type='monthly'`, ordered by `reference_date`.
- Tests use FastAPI TestClient; data-dependent tests skip when DB not loaded (reuse `data_is_complete`).

## File Structure

```
backend/app/
├── main.py                     # app factory, CORS, rate limiter, router registration
├── core/
│   ├── __init__.py
│   ├── config.py               # Settings (pydantic-settings) from backend/.env
│   └── rate_limit.py           # slowapi limiter
├── repositories/
│   ├── __init__.py
│   └── labor_repository.py     # read queries
├── services/
│   ├── __init__.py
│   └── labor_service.py        # row dicts -> response models
├── routers/
│   ├── __init__.py
│   ├── health.py
│   ├── kpis.py
│   ├── labor.py
│   └── underemployment.py
└── schemas/
    ├── __init__.py
    └── responses.py            # Pydantic response models

tests/api/
├── __init__.py
├── conftest.py                 # TestClient fixture + loaded-data skip
├── test_health.py
├── test_kpis.py
├── test_labor.py
└── test_underemployment.py
```

---

## Task 1: Config + app factory + health endpoint

**Files:** Create `backend/app/core/__init__.py`, `core/config.py`, `backend/app/routers/__init__.py`, `routers/health.py`, `backend/app/main.py`, `tests/api/__init__.py`, `tests/api/conftest.py`, `tests/api/test_health.py`.

**Interfaces:**
- Produces `backend.app.core.config.settings` (`app_env`, `cors_origins: list[str]`, `rate_limit_enabled: bool`).
- Produces `backend.app.main.create_app() -> FastAPI` and module-level `app`.
- `GET /api/health` → `{"status":"ok"}`.

- [ ] **Step 1: Failing test** — `tests/api/test_health.py`

```python
def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}
```

- [ ] **Step 2: `tests/api/conftest.py`**

```python
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from tests.integration.conftest import data_is_complete


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture(scope="session")
def require_data():
    if not data_is_complete():
        pytest.skip("DB not loaded — run python -m data_pipeline.scripts.run_etl")
```

Also create empty `tests/api/__init__.py`.

- [ ] **Step 3: Run test, expect fail** (`ModuleNotFoundError: backend.app.main`).

Run: `python -m pytest tests/api/test_health.py -v`

- [ ] **Step 4: `backend/app/core/config.py`**

```python
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    cors_origins: str = "http://localhost:3000"
    rate_limit_enabled: bool = True
    secret_key: str = "dev-secret"

    model_config = SettingsConfigDict(
        env_file="backend/.env", extra="ignore", case_sensitive=False)

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
```

- [ ] **Step 5: `backend/app/routers/health.py`**

```python
from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    return {"status": "ok"}
```

- [ ] **Step 6: `backend/app/main.py`**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.routers import health


def create_app() -> FastAPI:
    app = FastAPI(title="WorkWise PH API", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_methods=["GET"],
        allow_headers=["*"],
    )
    app.include_router(health.router, prefix="/api")
    return app


app = create_app()
```

Also create empty `backend/app/core/__init__.py`, `backend/app/routers/__init__.py`.

- [ ] **Step 7: Run test, expect pass.** Run: `python -m pytest tests/api/test_health.py -v`

- [ ] **Step 8: Commit** — `git add backend/app tests/api && git commit -m "feat(api): app factory, config, health endpoint"`

---

## Task 2: Response schemas + repository

**Files:** Create `backend/app/schemas/__init__.py`, `schemas/responses.py`, `backend/app/repositories/__init__.py`, `repositories/labor_repository.py`. Test: `tests/api/test_repository.py`.

**Interfaces:**
- `schemas.responses`: `Point(year:int, month:str|None, value:float|None, unit:str)`, `Series(indicator:str, sex:str, period:str, data:list[Point])`, `Kpi(indicator_name:str, value:float|None, unit:str, reference_date:date|None)`.
- `labor_repository`:
  - `fetch_series(source_table:str, indicator:str|None, sex:str, period_type:str, age_group:str="Total") -> list[dict]` — rows `{year, month, value, unit}` ordered by reference_date (nulls last), monthly only.
  - `fetch_kpis() -> list[dict]` — rows from `analytics.dashboard_kpis`.
  - `fetch_age_sex(source_table:str, sex:str, period_type:str) -> list[dict]` — rows `{year, month, age_group, value, unit}`.

- [ ] **Step 1: Failing test** — `tests/api/test_repository.py`

```python
import pytest
from backend.app.repositories import labor_repository as repo

pytestmark = pytest.mark.usefixtures("require_data")


def test_fetch_series_rates():
    rows = repo.fetch_series("raw.lfs_rates", "Unemployment Rate", "Both Sexes", "monthly")
    assert len(rows) > 50
    assert {"year", "month", "value", "unit"} <= set(rows[0].keys())
    assert rows[0]["unit"] == "percent"


def test_fetch_kpis():
    rows = repo.fetch_kpis()
    assert len(rows) >= 4
    assert {"indicator_name", "value", "unit", "reference_date"} <= set(rows[0].keys())
```

(Add `require_data` fixture import path: it lives in `tests/api/conftest.py`.)

- [ ] **Step 2: Run, expect fail.**

- [ ] **Step 3: `backend/app/schemas/responses.py`**

```python
from datetime import date
from pydantic import BaseModel


class Point(BaseModel):
    year: int
    month: str | None
    value: float | None
    unit: str


class Series(BaseModel):
    indicator: str
    sex: str
    period: str
    data: list[Point]


class Kpi(BaseModel):
    indicator_name: str
    value: float | None
    unit: str
    reference_date: date | None
```

- [ ] **Step 4: `backend/app/repositories/labor_repository.py`**

```python
from sqlalchemy import text
from backend.app.db.session import engine


def fetch_series(source_table, indicator, sex, period_type, age_group="Total"):
    sql = """
        SELECT year, month, value, unit
        FROM clean.fact_long
        WHERE source_table = :st AND sex = :sex
          AND period_type = :pt AND age_group = :ag
          AND (:ind IS NULL OR indicator_name = :ind)
        ORDER BY reference_date NULLS LAST
    """
    with engine.connect() as c:
        rows = c.execute(text(sql), {
            "st": source_table, "ind": indicator, "sex": sex,
            "pt": period_type, "ag": age_group}).mappings().all()
    return [dict(r) for r in rows]


def fetch_age_sex(source_table, sex, period_type):
    sql = """
        SELECT year, month, age_group, value, unit
        FROM clean.fact_long
        WHERE source_table = :st AND sex = :sex AND period_type = :pt
        ORDER BY reference_date NULLS LAST, age_group
    """
    with engine.connect() as c:
        rows = c.execute(text(sql), {
            "st": source_table, "sex": sex, "pt": period_type}).mappings().all()
    return [dict(r) for r in rows]


def fetch_kpis():
    sql = """
        SELECT indicator_name, value, unit, reference_date
        FROM analytics.dashboard_kpis
        ORDER BY unit, indicator_name
    """
    with engine.connect() as c:
        rows = c.execute(text(sql)).mappings().all()
    return [dict(r) for r in rows]
```

Create empty `backend/app/schemas/__init__.py`, `backend/app/repositories/__init__.py`.

- [ ] **Step 5: Run tests, expect pass.**

- [ ] **Step 6: Commit** — `feat(api): add response schemas and labor repository`

---

## Task 3: Service + labor/kpis routers

**Files:** Create `backend/app/services/__init__.py`, `services/labor_service.py`, `routers/labor.py`, `routers/kpis.py`. Modify `backend/app/main.py` (register routers). Test: `tests/api/test_labor.py`, `tests/api/test_kpis.py`.

**Interfaces:**
- `labor_service.get_series(source_table, indicator, sex, period_type) -> Series`, `get_kpis() -> list[Kpi]`, `get_age_sex(source_table, sex, period_type) -> list[dict]` (passthrough rows for age-sex grouping on the client).
- Routers:
  - `GET /api/labor/rates?indicator=&sex=Both Sexes` → `Series`.
  - `GET /api/labor/levels?indicator=&sex=Both Sexes` → `Series`.
  - `GET /api/labor/age-sex?source=employed&sex=Both Sexes` → `{"source":..., "data":[{year,month,age_group,value,unit}]}` (source key mapped to source_table via the registry).
  - `GET /api/kpis` → `list[Kpi]`.

- [ ] **Step 1: Failing tests** — `tests/api/test_kpis.py`

```python
import pytest
pytestmark = pytest.mark.usefixtures("require_data")


def test_kpis_endpoint(client):
    r = client.get("/api/kpis")
    assert r.status_code == 200
    body = r.json()
    assert isinstance(body, list) and len(body) >= 4
    assert {"indicator_name", "value", "unit", "reference_date"} <= set(body[0].keys())
```

`tests/api/test_labor.py`:

```python
import pytest
pytestmark = pytest.mark.usefixtures("require_data")


def test_rates_default(client):
    r = client.get("/api/labor/rates", params={"indicator": "Unemployment Rate"})
    assert r.status_code == 200
    body = r.json()
    assert body["indicator"] == "Unemployment Rate"
    assert body["sex"] == "Both Sexes"
    assert len(body["data"]) > 50
    assert body["data"][0]["unit"] == "percent"


def test_levels_default(client):
    r = client.get("/api/labor/levels", params={"indicator": "Employed Persons"})
    assert r.status_code == 200
    assert r.json()["data"][0]["unit"] == "persons"


def test_age_sex(client):
    r = client.get("/api/labor/age-sex", params={"source": "employed"})
    assert r.status_code == 200
    body = r.json()
    assert body["source"] == "employed"
    age_groups = {d["age_group"] for d in body["data"]}
    assert "Total" in age_groups and len(age_groups) >= 6
```

- [ ] **Step 2: Run, expect fail.**

- [ ] **Step 3: `backend/app/services/labor_service.py`**

```python
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
```

- [ ] **Step 4: `backend/app/routers/kpis.py`**

```python
from fastapi import APIRouter
from backend.app.services import labor_service
from backend.app.schemas.responses import Kpi

router = APIRouter(tags=["kpis"])


@router.get("/kpis", response_model=list[Kpi])
def kpis():
    return labor_service.get_kpis()
```

- [ ] **Step 5: `backend/app/routers/labor.py`**

```python
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
```

- [ ] **Step 6: Register routers in `main.py`** — add imports and `app.include_router(... prefix="/api")` for `kpis` and `labor`.

```python
from backend.app.routers import health, kpis, labor
# ...
    app.include_router(health.router, prefix="/api")
    app.include_router(kpis.router, prefix="/api")
    app.include_router(labor.router, prefix="/api")
```

- [ ] **Step 7: Run tests, expect pass.** Run: `python -m pytest tests/api/test_labor.py tests/api/test_kpis.py -v`

- [ ] **Step 8: Commit** — `feat(api): add labor + kpis services and routers`

---

## Task 4: Underemployment router + rate limiting + run verification

**Files:** Create `backend/app/routers/underemployment.py`, `backend/app/core/rate_limit.py`. Modify `main.py`. Test: `tests/api/test_underemployment.py`.

**Interfaces:**
- `GET /api/underemployment/summary?sex=Both Sexes` → `{"rate": Series, "by_age": {source:"underemployed", data:[...]}}` (rate from `raw.lfs_rates`/`Underemployment Rate`, by_age from `underemployed` age-sex).
- `GET /api/underemployment/visible-invisible?sex=Both Sexes` → `{"visible":[{year,month,value,unit}], "invisible":[...]}` (Total age group, monthly).
- `core/rate_limit.py`: slowapi `Limiter` keyed by remote IP; applied app-wide when `settings.rate_limit_enabled`.

- [ ] **Step 1: Failing test** — `tests/api/test_underemployment.py`

```python
import pytest
pytestmark = pytest.mark.usefixtures("require_data")


def test_summary(client):
    r = client.get("/api/underemployment/summary")
    assert r.status_code == 200
    body = r.json()
    assert body["rate"]["indicator"] == "Underemployment Rate"
    assert len(body["rate"]["data"]) > 50
    assert body["by_age"]["source"] == "underemployed"
    assert len(body["by_age"]["data"]) > 0


def test_visible_invisible(client):
    r = client.get("/api/underemployment/visible-invisible")
    assert r.status_code == 200
    body = r.json()
    assert len(body["visible"]) > 0 and len(body["invisible"]) > 0
    assert body["visible"][0]["unit"] == "persons"
```

- [ ] **Step 2: Run, expect fail.**

- [ ] **Step 3: `backend/app/routers/underemployment.py`**

```python
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
```

- [ ] **Step 4: `backend/app/core/rate_limit.py`**

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])
```

- [ ] **Step 5: Wire router + limiter in `main.py`**

```python
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from backend.app.core.rate_limit import limiter
from backend.app.routers import health, kpis, labor, underemployment
# inside create_app, after app = FastAPI(...):
    if settings.rate_limit_enabled:
        app.state.limiter = limiter
        app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    # ... existing CORS ...
    app.include_router(underemployment.router, prefix="/api")
```

- [ ] **Step 6: Run tests, expect pass.** Run: `python -m pytest tests/api -v`

- [ ] **Step 7: Smoke-run the server** — `uvicorn backend.app.main:app --port 8000` then `curl localhost:8000/api/health` returns `{"status":"ok"}` and `curl "localhost:8000/api/kpis"` returns JSON. Stop server.

- [ ] **Step 8: Commit** — `feat(api): add underemployment endpoints and rate limiting`

---

## Self-Review

- **Spec coverage:** §6 endpoints — health, kpis, labor/rates, labor/levels, labor/age-sex, underemployment/summary, underemployment/visible-invisible all implemented (Tasks 1,3,4). Layering core/repositories/services/routers/schemas matches §6. CORS + rate limiting → Task 4. Pydantic models → Task 2.
- **Deferred (correct for V1):** `/api/industry`, `/api/occupation`, `/api/education`, `/api/pay`, `/api/hours-worked`, `/api/forecast`, `/api/anomalies`, and all `/api/admin/*` — these belong to V2/V3 and are out of the V1 spec.
- **Type consistency:** `fetch_series` returns `{year,month,value,unit}` → `Point`; `fetch_kpis` returns `{indicator_name,value,unit,reference_date}` → `Kpi`; `source_table_for` maps registry keys; routers reference these consistently.
- **Placeholder scan:** none — all steps contain complete code.
