# WorkWise PH — V2.1 Industry & Occupation Trends Plan

> Execute task-by-task with TDD. Builds on V1 (single `clean.fact_long`).

**Goal:** Add industry (#10), occupation (#12, 2012 PSOC), and average pay (#16) data end-to-end: schema `category` column → two new parsers → ETL → API → `/industry` dashboard page.

**Global constraints:** category rows use `sex='Both Sexes'`, `age_group='Total'`, `category=<group>`. Units: persons (industry/occupation), PHP (pay). `.`→null, footer rows dropped, COPY bulk load. Default suite stays fast; heavy ETL behind `-m etl`.

## Tasks

### Task 1 — Schema: add `category` to fact_long (migration 0002)
- Add `category: Mapped[str|None]` to `FactLong` model + index `ix_fact_long_category` on `(source_table, category)`.
- `alembic revision --autogenerate -m "add category"` → `0002`; `alembic upgrade head`.
- Add `category` to `CLEAN_COLUMNS` (append) in `loader.py`.
- Test (`tests/integration/test_schema.py`): `fact_long` has `category` column.

### Task 2 — Category parser
- `data_pipeline/parsers/category.py::parse_category(path, spec) -> df[year,month,category,value_raw]`. Header row index 2 = categories; data from row 3; ffill year; keep valid months; drop cols where category NaN.
- Unit test with synthetic xlsx (industry-like: TOTAL + 2 categories).

### Task 3 — Pay-matrix parser
- `data_pipeline/parsers/pay_matrix.py::parse_pay_matrix(path, spec) -> df[year,month,category,value_raw]`. row2=year(ffill), row3=month, col0=category (strip leading `.`/space). Emit a row's records only if it has ≥1 numeric month cell (drops footers). 
- Unit test with synthetic xlsx (2 years × {Jan,Annual}, TOTAL + 1 category + a footer row).

### Task 4 — Clean + registry + loader dispatch
- `clean_long`: default `sex`→'Both Sexes' when absent; carry `category` (None if absent); indicator from new `CATEGORY_INDICATOR` map. Append `category` to returned columns.
- `config.TABLE_REGISTRY`: add `employed_industry` (cat, persons, raw.employed_industry_2009), `employed_occupation` (cat, persons, raw.employed_occupation_2012), `average_pay_industry` (pay_matrix, PHP, raw.average_pay_industry).
- `loader.parse_and_clean`: dispatch `category`→parse_category, `pay_matrix`→parse_pay_matrix.
- Tests: clean carries category + sets indicator; parse_and_clean for industry nonempty (mark `etl` if DB, else pure parse — pure).

### Task 5 — Load + data-quality
- Run `python -m data_pipeline.scripts.run_etl` (now 13 source tables).
- `test_data_quality`: source tables count == 13; pay rows have unit='PHP' and value>0.

### Task 6 — Backend endpoints
- `labor_repository`: `fetch_category_latest(source_table)`, `fetch_total_series(source_table)`.
- `services/sector_service.py`: `industry()`, `occupation()`, `pay()` returning `{latest:[{category,value,unit}], total_series:[{year,month,value,unit}]}` (pay: latest only).
- `routers/sectors.py`: `/industry/employment`, `/occupation/employment`, `/pay/industry`. Register in main.
- API tests (skip if no data): each returns latest non-empty + (industry/occupation) total_series non-empty; pay unit PHP.

### Task 7 — Frontend `/industry` page
- `lib/api.ts`: add `CategoryRow`, `SectorResp`, `PayResp` types.
- `components/CategoryBarChart.tsx`: bar of top-8 categories by value, excluding TOTAL.
- `app/industry/page.tsx`: top industries bar, industry TOTAL trend (reuse LineSeriesChart via inline Series), top occupations bar, pay-by-industry bar; loading/empty/error states.
- `components/Sidebar.tsx`: add link `{ href:"/industry", label:"Industry & Occupation" }`.
- Verify: `npm run build`; HTTP 200 on `/industry`.
