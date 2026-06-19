# WorkWise PH — Project Guide for Claude

Philippine labor-market analytics: PSA Labor Force Survey `.xlsx` → ETL → NeonDB
Postgres → FastAPI → Next.js dashboard. See `README.md` for setup, `Phases.md` for the
roadmap, `docs/superpowers/` for specs & plans.

## Layout
- `data_pipeline/` — ETL (parsers → clean long format → COPY load → analytics build)
- `backend/` — FastAPI (layered: `core/ db/ repositories/ services/ routers/ schemas/`); Alembic in `backend/alembic/`
- `frontend/` — Next.js 16 + Tailwind + Recharts (see `frontend/AGENTS.md`: Next 16 has breaking changes — consult `node_modules/next/dist/docs/`)
- `datasets/` — source PSA `.xlsx`

## Commands (run from repo root)
- `pytest` — fast suite (~30s): unit + read-only DB/API validators that skip if data absent
- `pytest -m etl` — heavy: full ETL round-trip (truncates + reloads; restores after)
- `python -m data_pipeline.scripts.run_etl` — load all datasets (~60s, COPY-based)
- `cd backend && alembic upgrade head` — apply migrations
- `cd frontend && npm run build` — typecheck + compile the dashboard

## Data model
All datasets normalize into ONE table `clean.fact_long` (cols: year, month, month_number,
period_type, reference_date, sex, age_group, category, indicator_name, value, unit,
source_table, source_updated_at), distinguished by `source_table`/`indicator_name`.
Analytics summaries: `analytics.monthly_labor_summary`, `analytics.dashboard_kpis`.
Four parser archetypes: `key_indicator` (rates/levels), `age_sex`, `category`
(industry/occupation/education/class/hours), `pay_matrix` (transposed pay grid).

## Recipe: add a new PSA dataset module
1. Identify the archetype (most new tables = `category`: single header row of categories, year/month rows).
2. `data_pipeline/config.py` → add a `TableSpec(key, filename, archetype, unit, source_table)`.
3. `data_pipeline/clean.py` → add the friendly name to `AGE_SEX_INDICATOR` or `CATEGORY_INDICATOR`.
4. If a genuinely new shape: write a parser in `data_pipeline/parsers/` (TDD with a synthetic xlsx) and register it in `loader.parse_and_clean`'s dispatch dict.
5. Bump `EXPECTED_SOURCE_TABLES` in `tests/integration/conftest.py`; update `test_config.py` and `test_data_quality.py` counts/assertions.
6. `python -m data_pipeline.scripts.run_etl` to load.
7. Backend: reuse `labor_repository.fetch_category_latest` / `fetch_total_series`; add a `services/<x>_service.py` + `routers/<x>.py`; register the router in `main.py`.
8. Frontend: add a page under `frontend/app/<x>/` (reuse `CategoryBarChart`/`LineSeriesChart`/`StateWrapper`) and a `Sidebar.tsx` link.

## Gotchas (do not relearn the hard way)
- **Bulk load with Postgres COPY, never pandas `to_sql`** — `to_sql` over Neon took ~10min vs ~60s. See `loader.load_clean`. Cast nullable ints (month_number) to `Int64` before COPY.
- **Alembic autogenerate is filtered to the `clean` schema** (`env.py` `_include_object`). The ETL builds `analytics.*` outside the ORM; without the filter autogenerate tries to DROP them. Keep migrations focused — review generated files before applying.
- **Pay (`unit='PHP'`) `0` values are missing sentinels → nulled in `clean_long`.** PSA levels are in **thousands of persons**.
- **Tests must not run the heavy ETL by default.** Mark destructive/ETL tests `@pytest.mark.etl`. Read-only tests skip via `data_is_complete()` when the DB isn't loaded.
- **Secrets only in gitignored `backend/.env`.** Never commit; never expose to frontend (only `NEXT_PUBLIC_API_URL`).
- Work on a feature branch; merge to `main` after the fast suite is green; commit per task.
