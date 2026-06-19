# WorkWise PH — V2.2 Education Module Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add employed-by-education (#14) and underemployed-by-education (#15) data end-to-end and a `/education` dashboard page showing employment by grade, underemployment by grade, and underemployment share by education group.

**Architecture:** Pure reuse of the V2.1 category pipeline — both files are the category archetype, so only registry entries, indicator-name mappings, an education service/router, and a frontend page are new. No new parser or schema change.

**Tech Stack:** existing (pandas ETL, FastAPI, Next.js + Recharts).

## Global Constraints

- Education data covers Jan 2023 – Apr 2026 only (modern snapshot; do not present as long-history).
- Category rows: `sex='Both Sexes'`, `age_group='Total'`, `category=<education level>`, unit `persons`.
- Source tables: `raw.education_employed`, `raw.education_underemployed`.
- Reuse `parse_category`, `fetch_category_latest`, `fetch_total_series`. Default test suite stays fast; heavy ETL behind `-m etl`.

---

## Task 1: Register education datasets + load + data-quality

**Files:**
- Modify: `data_pipeline/config.py` (registry), `data_pipeline/clean.py` (`CATEGORY_INDICATOR`)
- Modify: `tests/data_pipeline/test_config.py`, `tests/integration/conftest.py` (`EXPECTED_SOURCE_TABLES`), `tests/integration/test_data_quality.py`

**Interfaces:**
- Produces registry keys `education_employed`, `education_underemployed` (archetype `category`, unit `persons`).
- `CATEGORY_INDICATOR` gains `education_employed -> "Employed Persons by Education"`, `education_underemployed -> "Underemployed Persons by Education"`.

- [ ] **Step 1: Add registry entries** in `data_pipeline/config.py` after the pay spec:

```python
    TableSpec("education_employed",
              "14 Number of Employed Persons by Highest Grade Completed (2017 PSCED) January 2023 to April 2026.xlsx",
              "category", "persons", "raw.education_employed"),
    TableSpec("education_underemployed",
              "15 Number of Underemployed Persons by Highest Grade Completed (2017 PSCED) January 2023 to April 2026.xlsx",
              "category", "persons", "raw.education_underemployed"),
```

- [ ] **Step 2: Add indicator names** in `data_pipeline/clean.py` `CATEGORY_INDICATOR`:

```python
    "education_employed": "Employed Persons by Education",
    "education_underemployed": "Underemployed Persons by Education",
```

- [ ] **Step 3: Update registry test** — in `tests/data_pipeline/test_config.py` extend `v2`:

```python
    v2 = {"employed_industry", "employed_occupation", "average_pay_industry",
          "education_employed", "education_underemployed"}
```

- [ ] **Step 4: Run config test** — `python -m pytest tests/data_pipeline/test_config.py -q`. Expected: pass (15 tables).

- [ ] **Step 5: Bump expected source-table count** — `tests/integration/conftest.py`: `EXPECTED_SOURCE_TABLES = 15`.

- [ ] **Step 6: Add data-quality assertion** in `tests/integration/test_data_quality.py`:

```python
def test_education_sources_present(conn):
    n = conn.execute(text(
        "SELECT count(*) FROM clean.fact_long "
        "WHERE source_table IN ('raw.education_employed','raw.education_underemployed') "
        "AND category IS NOT NULL AND value IS NOT NULL")).scalar()
    assert n > 0
```

Also update `test_all_source_tables_present` to assert `== 15`.

- [ ] **Step 7: Run the ETL** — `python -m data_pipeline.scripts.run_etl`. Expected: `education_employed` and `education_underemployed` rows > 0; total source tables 15.

- [ ] **Step 8: Run data-quality** — `python -m pytest tests/integration/test_data_quality.py -q`. Expected: pass.

- [ ] **Step 9: Commit**

```bash
git add data_pipeline tests
git commit -m "feat(etl): register and load education datasets (#14/#15)"
```

---

## Task 2: Education API endpoints

**Files:**
- Create: `backend/app/services/education_service.py`, `backend/app/routers/education.py`
- Modify: `backend/app/main.py`
- Test: `tests/api/test_education.py`

**Interfaces:**
- `education_service.employment() -> {latest:[{category,value,unit}], total_series:[{year,month,value,unit}]}`
- `education_service.underemployment() -> same shape`
- Routes: `GET /api/education/employment`, `GET /api/education/underemployment`.

- [ ] **Step 1: Failing test** — `tests/api/test_education.py`

```python
import pytest
pytestmark = pytest.mark.usefixtures("require_data")


def test_education_employment(client):
    r = client.get("/api/education/employment")
    assert r.status_code == 200
    body = r.json()
    assert len(body["latest"]) > 0
    assert {"category", "value", "unit"} <= set(body["latest"][0].keys())
    cats = {row["category"] for row in body["latest"]}
    assert any("College" in c for c in cats)


def test_education_underemployment(client):
    r = client.get("/api/education/underemployment")
    assert r.status_code == 200
    assert len(r.json()["latest"]) > 0
```

- [ ] **Step 2: Run, expect fail** (404 / module missing).

- [ ] **Step 3: `backend/app/services/education_service.py`**

```python
from backend.app.repositories import labor_repository as repo

EMPLOYED = "raw.education_employed"
UNDEREMPLOYED = "raw.education_underemployed"


def employment() -> dict:
    return {
        "latest": repo.fetch_category_latest(EMPLOYED),
        "total_series": repo.fetch_total_series(EMPLOYED),
    }


def underemployment() -> dict:
    return {
        "latest": repo.fetch_category_latest(UNDEREMPLOYED),
        "total_series": repo.fetch_total_series(UNDEREMPLOYED),
    }
```

- [ ] **Step 4: `backend/app/routers/education.py`**

```python
from fastapi import APIRouter
from backend.app.services import education_service

router = APIRouter(prefix="/education", tags=["education"])


@router.get("/employment")
def education_employment():
    return education_service.employment()


@router.get("/underemployment")
def education_underemployment():
    return education_service.underemployment()
```

- [ ] **Step 5: Register in `backend/app/main.py`** — add `education` to the import and `app.include_router(education.router, prefix="/api")`.

```python
from backend.app.routers import health, kpis, labor, underemployment, sectors, education
# ...
    app.include_router(education.router, prefix="/api")
```

- [ ] **Step 6: Run tests** — `python -m pytest tests/api/test_education.py -q`. Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add backend/app tests/api/test_education.py
git commit -m "feat(api): add education employment/underemployment endpoints"
```

---

## Task 3: Education dashboard page

**Files:**
- Modify: `frontend/lib/api.ts` (reuse `SectorResp`), `frontend/components/Sidebar.tsx`
- Create: `frontend/app/education/page.tsx`

**Interfaces:** page is a client component using `useApi<SectorResp>` for both endpoints; computes underemployment share per category client-side.

- [ ] **Step 1: Add sidebar link** in `frontend/components/Sidebar.tsx` after Industry:

```tsx
  { href: "/education", label: "Education" },
```

- [ ] **Step 2: Create `frontend/app/education/page.tsx`**

```tsx
"use client";
import { useApi } from "@/lib/useApi";
import type { SectorResp } from "@/lib/api";
import CategoryBarChart from "@/components/CategoryBarChart";
import StateWrapper from "@/components/StateWrapper";

export default function Education() {
  const emp = useApi<SectorResp>("/education/employment");
  const und = useApi<SectorResp>("/education/underemployment");

  // Underemployment share (%) per education level at the latest period.
  const share = (() => {
    if (!emp.data || !und.data) return [];
    const empMap = new Map(emp.data.latest.map((r) => [r.category, r.value]));
    return und.data.latest
      .map((r) => {
        const e = empMap.get(r.category);
        const pct = e && r.value != null && e > 0 ? (r.value / e) * 100 : null;
        return { category: r.category, value: pct, unit: "percent" };
      })
      .filter((r) => r.value != null);
  })();

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">Education &amp; Underemployment</h2>
      <p className="mb-6 text-sm text-slate-500">Modern snapshot: Jan 2023 – Apr 2026.</p>
      <div className="grid gap-6 lg:grid-cols-2">
        <StateWrapper isLoading={emp.isLoading} error={emp.error} isEmpty={!emp.data?.latest.length}>
          {emp.data && <CategoryBarChart rows={emp.data.latest} label="Employed persons by education (latest)" topN={12} />}
        </StateWrapper>
        <StateWrapper isLoading={und.isLoading} error={und.error} isEmpty={!und.data?.latest.length}>
          {und.data && <CategoryBarChart rows={und.data.latest} label="Underemployed persons by education (latest)" topN={12} />}
        </StateWrapper>
        <StateWrapper isLoading={emp.isLoading || und.isLoading} error={emp.error || und.error} isEmpty={!share.length}>
          <CategoryBarChart rows={share} label="Underemployment share by education (%)" topN={12} />
        </StateWrapper>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build** — `cd frontend && npm run build`. Expected: `/education` route listed; build succeeds.

- [ ] **Step 4: Smoke test** — start backend (`uvicorn backend.app.main:app --port 8000`) and frontend (`npm run start -- --port 3000`); `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/education` → 200; `curl http://localhost:8000/api/education/employment` returns latest with a "College" category. Stop servers.

- [ ] **Step 5: Commit**

```bash
git add frontend
git commit -m "feat(frontend): add Education dashboard page"
```

---

## Self-Review

- **Spec coverage:** Phases.md Module 5 / Page 5 (Education) — employed by grade, underemployed by grade, underemployment share by education — all covered (Task 3). Datasets #14/#15 loaded (Task 1), endpoints (Task 2).
- **Type consistency:** education endpoints reuse the `SectorResp` shape (`latest` + `total_series`) and `fetch_category_latest`/`fetch_total_series` already in the repository; frontend reuses `CategoryBarChart`/`SectorResp`.
- **Placeholder scan:** none — every step has complete code/commands.
- **Deferred:** class-of-worker (#13), hours (#19/#20) → V2.3.
