# WorkWise PH — V3 Forecasting & Anomaly Detection Plan

> Execute task-by-task with TDD. New subsystem; reuses the existing DB/engine.

**Goal:** Forecast the 4 key rate indicators 6 months ahead with confidence bands, detect anomalous months, store results in `ml.*`, and surface them via `/api/forecast` + `/api/anomalies` and a `/forecasting` page.

**Architecture:** A pure `forecasting` module (no DB) does the math — Holt-Winters ETS on the monthly era (2021+), residual-based confidence band, seasonal-naive fallback, rolling z-score anomalies, and backtest metrics. A `forecast_pipeline` extracts each target's monthly series from `clean.fact_long`, runs the module, and writes `ml.forecast_results`, `ml.anomaly_results`, `ml.model_metrics`. The API reads those tables (or computes live for history).

**Tech:** statsmodels (Holt-Winters), numpy, pandas, FastAPI, Recharts.

## Global constraints
- Forecast targets: `Unemployment Rate`, `Underemployment Rate`, `Employment Rate`, `Labor Force Participation Rate` (source `raw.lfs_rates`, `sex='Both Sexes'`, monthly).
- Train only on monthly-cadence data (reference_date >= 2021-01-01) — earlier data is quarterly.
- Pure forecasting functions are unit-tested on synthetic series (deterministic, no DB). DB-writing pipeline + endpoints are `etl`/`require_data` gated.
- ml tables are generated (not ORM); created via the pipeline with pandas `to_sql(if_exists="replace")` (small tables).

## Tasks

### Task 1 — Forecasting core module (pure, TDD)
**Files:** `data_pipeline/forecasting.py`; `tests/data_pipeline/test_forecasting.py`.

**Interfaces:**
- `forecast_series(values: list[float], horizon=6, season=12) -> {"point": list[float], "lower": list[float], "upper": list[float]}` — drops Nones; Holt-Winters (add trend, add seasonal when `len>=2*season`), else trend-only, else flat; band = point ± 1.96·residual std.
- `backtest_metrics(values, horizon=6, season=12) -> {"mae": float|None, "rmse": float|None, "mape": float|None}` — holds out last `horizon`.
- `detect_anomalies(values, window=12, z=3.0) -> list[bool]` — rolling z-score; first `window` points never flagged.

Tests (synthetic): seasonal+trend 36-pt series → 6 finite points, `lower<=point<=upper`, forecast continues upward trend; short series (5 pts) → flat forecast = last value; injected spike flagged by `detect_anomalies`; `backtest_metrics` returns non-negative mae/rmse/mape on a 40-pt series.

Commit: `feat(ml): add forecasting core (Holt-Winters, anomalies, backtest)`.

### Task 2 — Forecast pipeline → ml.* tables
**Files:** `data_pipeline/forecast_pipeline.py`; `data_pipeline/scripts/generate_forecasts.py`; `tests/integration/test_forecasting_pipeline.py` (mark `etl`).

**Interfaces:**
- `monthly_rate_series(indicator: str) -> list[dict{reference_date, value}]` — from `clean.fact_long`, `source_table='raw.lfs_rates'`, `sex='Both Sexes'`, `period_type='monthly'`, `reference_date>= '2021-01-01'`, value not null, ordered.
- `run_forecasts() -> dict[str,int]` — for each target: build series, forecast (6), metrics, anomalies; write `ml.forecast_results` (cols: indicator, horizon_month (date), value, lower, upper, generated_at), `ml.anomaly_results` (indicator, reference_date, value, is_anomaly), `ml.model_metrics` (indicator, model, mae, rmse, mape, generated_at). Returns row counts.
- `python -m data_pipeline.scripts.generate_forecasts` runs it and prints counts.

Test (`etl`): run `run_forecasts()`; assert `ml.forecast_results` has 4 indicators × 6 = 24 rows; metrics has 4 rows; anomalies non-empty.

Commit: `feat(ml): forecast pipeline writing ml.forecast/anomaly/metrics`.

### Task 3 — API endpoints
**Files:** `backend/app/services/forecast_service.py`, `backend/app/routers/forecast.py`; modify `main.py`; `tests/api/test_forecast.py`.

**Interfaces:**
- `forecast_service.forecast(indicator) -> {"indicator", "history":[{reference_date,value}], "forecast":[{month,value,lower,upper}], "metrics":{mae,rmse,mape}}` — history from `monthly_rate_series`; forecast + metrics from `ml.*` (fallback: compute live via forecasting module if ml table empty).
- `forecast_service.anomalies(indicator) -> {"indicator","points":[{reference_date,value,is_anomaly}]}`.
- Routes: `GET /api/forecast?indicator=Unemployment Rate`, `GET /api/anomalies?indicator=...`. Default indicator = "Unemployment Rate".

Tests (`require_data`): `/api/forecast` returns 6 forecast points with numeric lower/upper and history non-empty; `/api/anomalies` returns points with `is_anomaly` booleans.

Commit: `feat(api): add forecast and anomaly endpoints`.

### Task 4 — Forecasting dashboard page
**Files:** `frontend/lib/api.ts` (types), `frontend/components/ForecastChart.tsx`, `frontend/app/forecasting/page.tsx`, `frontend/components/Sidebar.tsx`.

- `ForecastChart` — Recharts ComposedChart: history line + forecast line + CI band (Area between lower/upper).
- Page: indicator selector (4 rates), forecast chart, metrics cards (MAE/RMSE/MAPE), note that history is monthly 2021+.
- Sidebar link `/forecasting`.
- Verify: `npm run build`; `/forecasting` returns 200; `/api/forecast` returns data.

Commit: `feat(frontend): add forecasting page with CI band and metrics`.

## Self-review
- Targets, models, storage, endpoints, page all covered. Anomaly + metrics included.
- Deferred: ML regression models (RF/XGBoost), Isolation Forest, underemployed-count target → V3.1. Admin retrain button → V4.
