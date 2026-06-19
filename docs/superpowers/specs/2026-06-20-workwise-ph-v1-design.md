# WorkWise PH — V1 MVP Design

**Date:** 2026-06-20
**Status:** Approved
**Scope:** Version 1 MVP (full vertical slice), per `Phases.md`

---

## 1. Goal

Ship a working Philippine labor-market analytics dashboard as an end-to-end vertical
slice: real ETL of PSA Labor Force Survey tables → NeonDB Postgres → FastAPI → Next.js
dashboard, runnable and verifiable locally, with a clear handoff path to cloud
deployment (NeonDB / Render / Vercel).

Forecasting, anomaly detection, admin auth/upload, and the industry/occupation/
education/pay/hours modules are explicitly **deferred to V2+**.

## 2. Repository

- Monorepo at the project root, pushed to `github.com/somarjez/workwiseph.git`, branch `main`.
- Structure (per `Phases.md` §10):

```
workwiseph/
├── frontend/            # Next.js + TS + Tailwind + Recharts
├── backend/             # FastAPI (layered)
├── data_pipeline/       # ETL: xlsx → clean long format → Postgres
│   ├── raw/             # (datasets live at repo-root /datasets in V1)
│   ├── processed/       # generated csv/parquet (gitignored)
│   ├── scripts/
│   └── notebooks/
├── models/              # artifacts/ metrics/ (unused in V1)
├── database/            # alembic migrations + schema.sql
├── datasets/            # source PSA .xlsx (committed)
├── docs/
└── README.md
```

## 3. Data Scope (V1 — 10 source tables)

Core 8 (by sex/age): Rates KEI, Levels KEI, Population 15+, Labor Force, Employed,
Unemployed, Underemployed, Not-in-Labor-Force. Plus Visible + Invisible Underemployed
(required for the Underemployment page's visible-vs-invisible chart).

Deferred to V2: industry, occupation, class of worker, education (employed +
underemployed), average pay, mean hours worked, hours-worked bands.

### Source format (PSA OpenSTAT wide)

- Row 0: title with date range; row 1 blank.
- Rows 2–3: two-level header — indicator group (row 2, merged) × breakdown
  (row 3: `Both sexes/Male/Female` for rates/levels; `Total` + age bands for age-sex tables).
- Column 0: year (only on the first month of each year → forward-fill).
- Column 1: month name.
- Missing values: `.` → NULL.
- Levels are reported in **thousands of persons**; preserved as-is and documented.

## 4. ETL Pipeline (`data_pipeline/`)

Python + pandas + openpyxl. Stages:

1. **Parse** each xlsx: drop title/blank rows, reconstruct multi-row header, forward-fill
   year, melt to long format.
2. **Clean** (rules from §7): `.`→null, strip commas → numeric, normalize `Both sexes`→
   `Both Sexes`, keep `Annual` rows but flag `period_type`, mark 2026 `partial`, keep rates
   (`unit=percent`) separate from levels (`unit=persons`/thousands).
3. **Standard long-format columns:** `year, month, month_number, period_type,
   reference_date, sex, age_group, indicator_name, value, unit, source_table,
   source_updated_at`.
4. **Load** to `raw.*`, transform into `clean.fact_*`, build `analytics.*` summaries.

Scripts: `load_raw_data.py`, `clean_lfs_rates.py`, `clean_lfs_levels.py`,
`clean_age_sex_tables.py`, `build_dashboard_tables.py`, plus an orchestrator `run_etl.py`.

## 5. Database (NeonDB Postgres)

SQLAlchemy + Alembic. Schemas created: `raw`, `clean`, `analytics`, `ml`, `auth`, `logs`
(only `raw`/`clean`/`analytics` populated in V1).

- **Dimensions:** `clean.dim_date`, `dim_sex`, `dim_age_group`, `dim_indicator`.
- **Facts:** `clean.fact_key_indicator_rates`, `fact_key_indicator_levels`,
  `fact_population_age_sex`, `fact_labor_force_age_sex`, `fact_employed_age_sex`,
  `fact_unemployed_age_sex`, `fact_underemployed_age_sex`, `fact_not_in_labor_force_age_sex`,
  `fact_underemployment_type` (visible/invisible).
- **Analytics:** `analytics.monthly_labor_summary`, `underemployment_summary`,
  `age_gender_summary`, `dashboard_kpis`.
- Indexes on `(year, month_number)`, `sex`, `age_group`, `indicator_name`.

Connection via `DATABASE_URL` / `DATABASE_URL_POOLER` env vars (pooled for deployed use).

## 6. Backend (`backend/`, FastAPI)

Layered per `Phases.md` §7:

```
app/
├── main.py
├── core/        config.py, security.py (stub), rate_limit.py
├── db/          session.py, models.py
├── repositories/labor_repository.py
├── services/    labor_service.py, underemployment_service.py
├── routers/     health.py, labor.py, underemployment.py, kpis.py
└── schemas/     responses.py
```

V1 endpoints:
`GET /api/health`, `GET /api/kpis`, `GET /api/labor/rates`, `GET /api/labor/levels`,
`GET /api/labor/age-sex`, `GET /api/underemployment/summary`,
`GET /api/underemployment/visible-invisible`.

Common query filters: `year`, `sex`, `age_group`, `period_type`, `indicator`.
Pydantic response models; CORS restricted to the frontend origin; rate limiting via
slowapi (public 60/min, enabled by `RATE_LIMIT_ENABLED`). Structured error responses.

## 7. Frontend (`frontend/`, Next.js + TS + Tailwind + Recharts)

App-router layout with sidebar nav. Pages:

- `/` Overview — 6 KPI cards (latest employment/unemployment/underemployment/LFPR,
  total employed, total underemployed) + labor-indicators-over-time and
  employment-vs-unemployment charts.
- `/underemployment` — rate by sex, underemployed by age group, visible vs invisible.
- `/age-gender` — labor force / employment / unemployment by age group, male-vs-female
  participation gap.

Filters (year/sex/age-group), loading/empty/error states. Only `NEXT_PUBLIC_API_URL`
is exposed to the browser; no DB credentials client-side.

## 8. Testing

- **Backend (pytest):** health, kpis, each filtered endpoint returns valid shape.
- **Data tests:** no negative levels, rates within 0–100, sex labels normalized, required
  columns present, 2026 flagged partial, annual rows flagged.
- **Frontend:** smoke test that each page renders without error.

## 9. Deployment (handoff)

I author `render.yaml` (backend web service + start command), `vercel.json`,
`.env.example` files, and a `docs/DEPLOYMENT.md` runbook. The user performs the NeonDB
project / Render / Vercel dashboard steps. Render cron jobs deferred to V3 (model
retraining).

## 10. Out of Scope (V1)

Forecasting, anomaly detection, ML tables population, admin login/upload, industry /
occupation / class-of-worker / education / pay / hours pages, dark mode, Render cron.

## 11. Security Notes

- `DATABASE_URL` only in `backend/.env` (gitignored) / Render env. Never in frontend or git.
- `.gitignore` excludes all `.env`; `.env.example` files document required keys.
- SQLAlchemy parameterized queries only. CSV/upload validation deferred with admin module.
