# WorkWise PH — Labor Market & Underemployment Analytics

WorkWise PH transforms Philippine Statistics Authority (PSA) Labor Force Survey
tables into an interactive analytics dashboard covering employment, unemployment,
underemployment, labor-force participation, and age/sex breakdowns. It pairs a
PostgreSQL-backed ETL pipeline with a FastAPI service and a Next.js dashboard.

> **Status: V1–V4 complete.** Portfolio landing page + dashboards for Overview,
> Underemployment, Age & Gender, Industry & Occupation, Education, Workforce, and
> Forecasting (Holt-Winters & Random Forest forecasts, z-score & Isolation-Forest
> anomalies), plus a secure admin area (JWT login, background ETL/forecast triggers,
> validated CSV upload, run logs). Dark mode and CSV/PNG chart export throughout.
> 18 PSA tables (2005–April 2026) normalized into one long fact table.

## Architecture

```
PSA .xlsx  →  ETL (pandas)  →  NeonDB Postgres  →  FastAPI  →  Next.js dashboard
              data_pipeline/    clean.fact_long     backend/     frontend/
                                analytics.*
```

## Repository layout

| Path | Purpose |
| --- | --- |
| `datasets/` | Source PSA Labor Force Survey `.xlsx` tables |
| `data_pipeline/` | ETL: parse wide PSA tables → clean long format → load Postgres |
| `backend/` | FastAPI service (layered: core / repositories / services / routers / schemas) |
| `frontend/` | Next.js + TypeScript + Tailwind + Recharts dashboard |
| `database/` | (reserved) SQL artifacts; migrations live in `backend/alembic/` |
| `docs/superpowers/` | Design spec and implementation plans |

## Prerequisites

- Python 3.12, Node 20+, a NeonDB (or any Postgres) connection string.

## Local setup

### 1. Backend + database

```bash
cp backend/.env.example backend/.env      # then set DATABASE_URL to your Neon string
pip install -e "backend[dev]"

# create schema + tables
cd backend && alembic upgrade head && cd ..

# load the data (~60s)
python -m data_pipeline.scripts.run_etl

# run the API
uvicorn backend.app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs · health: http://localhost:8000/api/health

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local          # NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev                               # http://localhost:3000
```

## Tests

```bash
pytest                  # fast: unit + read-only API/DB validators (~30s)
pytest -m etl           # heavy: full ETL round-trip against the database
cd frontend && npm run build   # type-checks + compiles the dashboard
```

The default `pytest` run skips data-dependent tests when the database is empty;
run the ETL first to exercise them.

## API endpoints (V1)

Public: `GET /api/health` · `/api/kpis` · `/api/labor/rates|levels|age-sex`
· `/api/underemployment/summary|visible-invisible` · `/api/industry/employment`
· `/api/occupation/employment` · `/api/pay/industry` · `/api/education/employment|underemployment`
· `/api/worker-class` · `/api/hours-worked` · `/api/mean-hours` · `/api/forecast` · `/api/anomalies`

`/api/forecast` and `/api/anomalies` accept `?method=` (`ets`|`rf`, `zscore`|`iforest`).

Admin (JWT): `POST /api/admin/login` · `POST /api/admin/etl/run` · `POST /api/admin/forecast/run`
· `POST /api/admin/upload` (CSV) · `GET /api/admin/logs`

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Neon (database), Render (API), Vercel (frontend).

## Notes on the data

- PSA "levels" are reported in **thousands of persons**; rates are percentages.
- Early years and 2026 are partial (many months carry no value); the pipeline keeps
  these as nulls rather than inventing data.
- All 10 core tables are normalized into a single `clean.fact_long` table,
  distinguished by `source_table` / `indicator_name`.
