# WorkWise PH — Roadmap V2 (Improvements)

The original `Phases.md` roadmap (V1–V4) is functionally complete: ETL of 18 PSA tables,
layered FastAPI, 9 dashboard pages, forecasting + anomaly detection, secure admin (auth,
CSV upload, run logs), CI, and an editorial UI redesign. This document tracks improvements
to the **current** system — the gaps and the next level of polish.

## Status of original Phases.md

| Area | State |
| --- | --- |
| Phases 1, 3, 4, 6, 7 (build), 9, 10 (configs), 12 | ✅ Done |
| Phase 8 — interactive filters (sex / time range) | ✅ Done (Roadmap V2 §1) |
| Phase 8 — filters (age group, month) | 🔲 Partial — see §1 |
| Phase 2 — DATA_DICTIONARY / DATA_SOURCES / DATA_CLEANING_RULES | 🔲 Not done — §3 |
| Phase 5 — EDA notebook + EDA_FINDINGS.md | 🔲 Not done — §4 |
| Phase 11 — frontend filter/chart tests | 🔲 Not done — §5 |
| Cloud deployment (Render/Vercel/Neon prod) | 🔲 User action — DEPLOYMENT.md |

## §1 Interactivity (in progress)

**Done:** a reusable `PillGroup` segmented control; **Sex** filter (All / Male / Female)
on Overview, Underemployment, and Age & Gender (re-queries the API); **time-range** filter
(All / 10Y / 5Y) on trend lines (client-side). The sex filter surfaces real gaps
(e.g. labor-force participation ~74% male vs ~51% female).

**Done:** **Compare mode** — a "Compare" option on the sex filter overlays Male vs Female
on one chart (MultiLineChart for rate trends, GroupedAgeBarChart for age bands) on
Overview, Underemployment, and Age & Gender.

**Next:**
- **Year selector** for the age-group snapshot charts (currently fixed to the latest year);
  expose available years from the API.
- **Age-group filter** on Age & Gender (single-age-band focus).
- **URL-synced filters** (querystring) so a filtered view is shareable/bookmarkable.
- Industry/Occupation: **drill-down** from a sector bar into its sub-categories.

## §2 Data presentation

- Latest-value **delta badges** on KPI cards (▲/▼ vs previous period / prior year).
- A small **"as of <month year>"** dateline on each chart sourced from the data.
- Number formatting helpers (thousands → M, locale grouping) centralized.

## §3 Data documentation (Phase 2 outputs)

- `DATA_DICTIONARY.md` — every source table, its columns, units (note: levels are in
  thousands; rates are percent; pay is PHP), coverage, and cadence (quarterly pre-2021,
  monthly after).
- `DATA_SOURCES.md` — PSA OpenSTAT provenance + internal reference codes.
- `DATA_CLEANING_RULES.md` — the implemented rules (`.`→null, sex normalization, 0-pay
  sentinel, partial-year handling, PSIC/PSOC classification breaks kept separate).

## §4 Exploratory analysis (Phase 5 outputs)

- `data_pipeline/notebooks/EDA_REPORT.ipynb` against `clean.fact_long`.
- `EDA_FINDINGS.md` — answers to the Phase 5 questions (peak unemployment years, sex
  participation gap, age groups with highest unemployment, underemployment vs hours,
  largest-employing industries, education vs underemployment).

## §5 Quality

- Frontend component tests (Vitest + Testing Library) for filters, chart rendering, and
  the loading/empty/error states.
- An accessibility pass (axe) on each page; verify contrast in both themes and keyboard
  operability of the new controls.
- Lighthouse/perf budget check on the deployed frontend.

## §6 Analytics depth (stretch)

- More forecast targets (underemployed count) and an XGBoost model option alongside
  ETS / Random Forest, with a model-comparison view.
- Surface anomalies visually on the trend charts (markers), reusing `/api/anomalies`.
- A simple "labor condition" classification per month (stable / strained) from the rates.
