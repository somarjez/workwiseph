# WorkWise PH — Data Foundation Implementation Plan (Plan A of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Parse the 10 core PSA Labor Force Survey `.xlsx` tables into a clean long-format and load them into NeonDB Postgres (`raw` + `clean` fact tables + `analytics` summaries), verified by data-quality tests.

**Architecture:** Pure parser functions (no DB) convert PSA's two-archetype wide format into a uniform long DataFrame; a cleaning module normalizes values; SQLAlchemy + Alembic define and migrate the schema; a loader writes DataFrames to Postgres; an analytics builder derives summary tables; an orchestrator runs the pipeline end-to-end. Parser/clean logic is unit-tested in isolation (fast, no DB); schema/loader/analytics are integration-tested against the dev NeonDB.

**Tech Stack:** Python 3.12, pandas, openpyxl, SQLAlchemy 2.x, Alembic, psycopg2-binary, pytest, python-dotenv.

## Global Constraints

- Python 3.12; all ETL code under `data_pipeline/`, DB layer under `backend/app/db/` and migrations under `backend/alembic/`.
- `DATABASE_URL` is read from `backend/.env` (gitignored) — never hardcode credentials.
- Long-format standard columns (exact order): `year, month, month_number, period_type, reference_date, sex, age_group, indicator_name, value, unit, source_table, source_updated_at`.
- Cleaning rules: `.` → NULL; strip commas → numeric; `Both sexes` → `Both Sexes`; `Annual` rows kept with `period_type='annual'` (monthly rows `period_type='monthly'`); year 2026 rows additionally flagged via `period_type` suffix is NOT used — instead 2026 completeness is asserted in tests only.
- Levels are in **thousands of persons**; preserve raw values, set `unit='persons'` for levels, `unit='percent'` for rates.
- Postgres schemas: `raw`, `clean`, `analytics`, `ml`, `auth`, `logs` (only first three populated in V1).
- TDD: write failing test → confirm fail → minimal implementation → confirm pass → commit. Frequent commits.
- All SQL via SQLAlchemy parameterized constructs; no string-interpolated SQL.

---

## File Structure

```
backend/
├── pyproject.toml                  # backend + shared deps (also used by ETL)
├── alembic.ini
├── alembic/
│   ├── env.py
│   └── versions/0001_initial_schema.py
└── app/
    ├── __init__.py
    └── db/
        ├── __init__.py
        ├── base.py                 # SQLAlchemy Base + metadata (schemas)
        ├── session.py              # engine + SessionLocal from DATABASE_URL
        └── models.py               # dim/fact/analytics ORM models

data_pipeline/
├── __init__.py
├── config.py                       # loads DATABASE_URL, paths, table registry
├── parsers/
│   ├── __init__.py
│   ├── key_indicator.py            # parse rates/levels archetype
│   └── age_sex.py                  # parse age-sex archetype
├── clean.py                        # normalization + derived columns
├── loader.py                       # DataFrame -> raw + clean tables
├── analytics_builder.py            # build analytics.* summaries
└── scripts/
    └── run_etl.py                  # orchestrator

tests/
├── conftest.py
├── data_pipeline/
│   ├── fixtures/                   # tiny synthetic xlsx written by tests
│   ├── test_key_indicator_parser.py
│   ├── test_age_sex_parser.py
│   └── test_clean.py
└── integration/
    ├── test_schema.py
    ├── test_loader.py
    └── test_data_quality.py
```

---

## Task 1: Python tooling, config, and table registry

**Files:**
- Create: `backend/pyproject.toml`
- Create: `data_pipeline/__init__.py`, `data_pipeline/config.py`
- Create: `tests/__init__.py`, `tests/data_pipeline/__init__.py`, `tests/data_pipeline/test_config.py`
- Create: `backend/.env.example`

**Interfaces:**
- Produces: `data_pipeline.config.settings` (object with `.database_url: str`, `.datasets_dir: Path`), `data_pipeline.config.TABLE_REGISTRY: list[TableSpec]` where `TableSpec` is a dataclass with fields `key: str`, `filename: str`, `archetype: Literal["key_indicator","age_sex"]`, `unit: str`, `source_table: str`, and (for key_indicator) `indicators: list[str]`.

- [ ] **Step 1: Write `backend/pyproject.toml`**

```toml
[project]
name = "workwise-backend"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
  "fastapi>=0.115",
  "uvicorn[standard]>=0.30",
  "sqlalchemy>=2.0",
  "alembic>=1.13",
  "psycopg2-binary>=2.9",
  "pandas>=2.2",
  "openpyxl>=3.1",
  "pydantic>=2.7",
  "pydantic-settings>=2.3",
  "python-dotenv>=1.0",
  "slowapi>=0.1.9",
]

[project.optional-dependencies]
dev = ["pytest>=8.0", "httpx>=0.27"]

[tool.pytest.ini_options]
pythonpath = ["."]
testpaths = ["tests"]
```

- [ ] **Step 2: Install deps into the active environment**

Run: `cd backend && pip install -e ".[dev]"`
Expected: installs without error; `pip show sqlalchemy` shows version ≥ 2.0.

- [ ] **Step 3: Write the failing test** — `tests/data_pipeline/test_config.py`

```python
from pathlib import Path
from data_pipeline.config import settings, TABLE_REGISTRY


def test_database_url_loaded():
    assert settings.database_url.startswith("postgresql")


def test_datasets_dir_exists():
    assert settings.datasets_dir.is_dir()


def test_registry_has_ten_core_tables():
    keys = {t.key for t in TABLE_REGISTRY}
    expected = {
        "rates", "levels", "population", "labor_force", "employed",
        "unemployed", "underemployed", "not_in_labor_force",
        "visible_underemployed", "invisible_underemployed",
    }
    assert keys == expected


def test_every_registry_file_exists():
    for t in TABLE_REGISTRY:
        assert (settings.datasets_dir / t.filename).is_file(), t.filename
```

- [ ] **Step 4: Run test to verify it fails**

Run: `cd backend && python -m pytest ../tests/data_pipeline/test_config.py -v` (run from repo root: `python -m pytest tests/data_pipeline/test_config.py -v`)
Expected: FAIL with `ModuleNotFoundError: data_pipeline.config`.

- [ ] **Step 5: Write `data_pipeline/config.py`**

```python
from __future__ import annotations
from dataclasses import dataclass, field
from pathlib import Path
from dotenv import load_dotenv
import os

REPO_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(REPO_ROOT / "backend" / ".env")


@dataclass(frozen=True)
class Settings:
    database_url: str
    datasets_dir: Path


settings = Settings(
    database_url=os.environ.get("DATABASE_URL", ""),
    datasets_dir=REPO_ROOT / "datasets",
)


@dataclass(frozen=True)
class TableSpec:
    key: str
    filename: str
    archetype: str            # "key_indicator" | "age_sex"
    unit: str                 # "percent" | "persons"
    source_table: str
    indicators: list[str] = field(default_factory=list)


TABLE_REGISTRY: list[TableSpec] = [
    TableSpec("rates", "2 Rates Key Employment Indicators.xlsx", "key_indicator",
              "percent", "raw.lfs_rates",
              ["Labor Force Participation Rate", "Employment Rate",
               "Unemployment Rate", "Underemployment Rate"]),
    TableSpec("levels", "1 Levels of Key Employment Indicators.xlsx", "key_indicator",
              "persons", "raw.lfs_levels",
              ["Total Population 15 Years Old and Over", "Persons in the Labor Force",
               "Employed Persons", "Unemployed Persons", "Underemployed Persons"]),
    TableSpec("population", "3 Population 15 Years Old and Over by Sex and by Age Group.xlsx",
              "age_sex", "persons", "raw.population_age_sex"),
    TableSpec("labor_force", "4 Persons in the Labor Force by Sex and by Age Group.xlsx",
              "age_sex", "persons", "raw.labor_force_age_sex"),
    TableSpec("employed", "5 Employed Persons by Sex and by Age Group.xlsx",
              "age_sex", "persons", "raw.employed_age_sex"),
    TableSpec("unemployed", "6 Unemployed Persons by Sex and by Age Group.xlsx",
              "age_sex", "persons", "raw.unemployed_age_sex"),
    TableSpec("underemployed", "7 Underemployed Persons by Sex and by Age Group.xlsx",
              "age_sex", "persons", "raw.underemployed_age_sex"),
    TableSpec("not_in_labor_force", "8 Persons Not in the Labor Force by Sex and by Age Group.xlsx",
              "age_sex", "persons", "raw.not_in_labor_force_age_sex"),
    TableSpec("visible_underemployed",
              "17 Visibly Underemployed Persons by Sex and by Age Group April 2005 to April 2026.xlsx",
              "age_sex", "persons", "raw.visible_underemployed_age_sex"),
    TableSpec("invisible_underemployed",
              "18 Invisibly Underemployed Persons by Sex and by Age Group April 2005 to April 2026.xlsx",
              "age_sex", "persons", "raw.invisible_underemployed_age_sex"),
]
```

Also create empty `data_pipeline/__init__.py`, `tests/__init__.py`, `tests/data_pipeline/__init__.py`, and `backend/.env.example`:

```env
APP_ENV=development
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
DATABASE_URL_POOLER=postgresql://USER:PASSWORD@HOST-pooler/DB?sslmode=require
SECRET_KEY=change-me
CORS_ORIGINS=http://localhost:3000
RATE_LIMIT_ENABLED=true
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `python -m pytest tests/data_pipeline/test_config.py -v`
Expected: 4 passed.

- [ ] **Step 7: Commit**

```bash
git add backend/pyproject.toml backend/.env.example data_pipeline/ tests/
git commit -m "feat(etl): add config, table registry, and Python tooling"
```

---

## Task 2: Key-indicator parser (rates + levels)

**Files:**
- Create: `data_pipeline/parsers/__init__.py`, `data_pipeline/parsers/key_indicator.py`
- Test: `tests/data_pipeline/test_key_indicator_parser.py`

**Interfaces:**
- Consumes: `TableSpec` from `data_pipeline.config`.
- Produces: `parse_key_indicator(path: Path, spec: TableSpec) -> pandas.DataFrame` returning columns `["year","month","sex","indicator_name","value_raw"]` — long format, one row per (year, month, indicator, sex). `value_raw` is the original cell string (`.` preserved, NOT yet cleaned). Year is forward-filled. Footer rows (where month is not a valid month/`Annual`) are dropped.

- [ ] **Step 1: Write the failing test** — `tests/data_pipeline/test_key_indicator_parser.py`

```python
import pandas as pd
from pathlib import Path
from openpyxl import Workbook
from data_pipeline.config import TableSpec
from data_pipeline.parsers.key_indicator import parse_key_indicator

SPEC = TableSpec("rates", "x.xlsx", "key_indicator", "percent", "raw.lfs_rates",
                 ["Labor Force Participation Rate", "Employment Rate"])


def _make_xlsx(tmp_path: Path) -> Path:
    wb = Workbook(); ws = wb.active
    ws.append(["Rates Key Employment Indicators: April 2005 to April 2026"])  # row0 title
    ws.append([])                                                              # row1 blank
    ws.append([None, None, "Labor Force Participation Rate", None, None,
               "Employment Rate", None, None])                                 # row2 groups
    ws.append([None, None, "Both sexes", "Male", "Female",
               "Both sexes", "Male", "Female"])                               # row3 sexes
    ws.append([2005, "January", ".", ".", ".", ".", ".", "."])
    ws.append([None, "April", "64.821", "79.517", "50.201", "91.72", "92", "91"])
    ws.append([None, "Annual", "63.0", "78.0", "49.0", "90.0", "91", "89"])
    ws.append(["Database:"])  # footer
    p = tmp_path / "x.xlsx"; wb.save(p); return p


def test_parse_shape_and_columns(tmp_path):
    df = parse_key_indicator(_make_xlsx(tmp_path), SPEC)
    assert list(df.columns) == ["year", "month", "sex", "indicator_name", "value_raw"]
    # 3 data rows (Jan, April, Annual) x 2 indicators x 3 sexes = 18
    assert len(df) == 18


def test_year_forward_filled(tmp_path):
    df = parse_key_indicator(_make_xlsx(tmp_path), SPEC)
    assert set(df["year"].unique()) == {2005}


def test_footer_dropped(tmp_path):
    df = parse_key_indicator(_make_xlsx(tmp_path), SPEC)
    assert "Database:" not in df["month"].values


def test_value_preserved_raw(tmp_path):
    df = parse_key_indicator(_make_xlsx(tmp_path), SPEC)
    row = df[(df.month == "April") & (df.sex == "Both sexes") &
             (df.indicator_name == "Labor Force Participation Rate")]
    assert row.iloc[0]["value_raw"] == "64.821"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest tests/data_pipeline/test_key_indicator_parser.py -v`
Expected: FAIL with `ModuleNotFoundError: data_pipeline.parsers.key_indicator`.

- [ ] **Step 3: Write `data_pipeline/parsers/key_indicator.py`**

```python
from __future__ import annotations
from pathlib import Path
import pandas as pd
from data_pipeline.config import TableSpec

VALID_MONTHS = {
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December", "Annual",
}


def parse_key_indicator(path: Path, spec: TableSpec) -> pd.DataFrame:
    raw = pd.read_excel(path, header=None)
    groups = raw.iloc[2].ffill()          # indicator group per column
    sexes = raw.iloc[3]                    # sex per column
    body = raw.iloc[4:].copy()
    body[0] = body[0].ffill()              # forward-fill year
    body = body[body[1].isin(VALID_MONTHS)]  # drop footer / blank rows

    records = []
    for col in range(2, raw.shape[1]):
        indicator = groups[col]
        sex = sexes[col]
        if pd.isna(indicator) or pd.isna(sex):
            continue
        for _, r in body.iterrows():
            records.append({
                "year": int(r[0]),
                "month": r[1],
                "sex": sex,
                "indicator_name": indicator,
                "value_raw": r[col],
            })
    return pd.DataFrame(records,
                        columns=["year", "month", "sex", "indicator_name", "value_raw"])
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `python -m pytest tests/data_pipeline/test_key_indicator_parser.py -v`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add data_pipeline/parsers/ tests/data_pipeline/test_key_indicator_parser.py
git commit -m "feat(etl): add key-indicator (rates/levels) parser"
```

---

## Task 3: Age-sex parser

**Files:**
- Create: `data_pipeline/parsers/age_sex.py`
- Test: `tests/data_pipeline/test_age_sex_parser.py`

**Interfaces:**
- Consumes: `TableSpec`.
- Produces: `parse_age_sex(path: Path, spec: TableSpec) -> pandas.DataFrame` returning columns `["year","month","sex","age_group","value_raw"]`. Sex from row 2 (forward-filled across its 7 columns), age group from row 3 (`Total` + 6 bands). Footer rows dropped, year forward-filled.

- [ ] **Step 1: Write the failing test** — `tests/data_pipeline/test_age_sex_parser.py`

```python
from pathlib import Path
from openpyxl import Workbook
from data_pipeline.config import TableSpec
from data_pipeline.parsers.age_sex import parse_age_sex

SPEC = TableSpec("underemployed", "x.xlsx", "age_sex", "persons", "raw.underemployed_age_sex")
AGES = ["Total", "15 - 24 Years Old", "25 - 34 Years Old", "35 - 44 Years Old",
        "45 - 54 Years Old", "55 - 64 Years Old", "65 Years Old and Over"]


def _make_xlsx(tmp_path: Path) -> Path:
    wb = Workbook(); ws = wb.active
    ws.append(["Underemployed Persons by Sex and by Age Group: April 2005 to April 2026"])
    ws.append([])
    ws.append([None, None, "Both Sexes", None, None, None, None, None, None,
               "Male", None, None, None, None, None, None,
               "Female", None, None, None, None, None, None])
    ws.append([None, None] + AGES + AGES + AGES)
    ws.append([2005, "January"] + ["."] * 21)
    ws.append([None, "April"] + [str(i) for i in range(1, 22)])
    ws.append(["Internal reference code:"])
    p = tmp_path / "x.xlsx"; wb.save(p); return p


def test_columns_and_shape(tmp_path):
    df = parse_age_sex(_make_xlsx(tmp_path), SPEC)
    assert list(df.columns) == ["year", "month", "sex", "age_group", "value_raw"]
    # 2 month rows x 3 sexes x 7 age groups = 42
    assert len(df) == 42


def test_sex_forward_filled(tmp_path):
    df = parse_age_sex(_make_xlsx(tmp_path), SPEC)
    assert set(df["sex"].unique()) == {"Both Sexes", "Male", "Female"}


def test_age_groups(tmp_path):
    df = parse_age_sex(_make_xlsx(tmp_path), SPEC)
    assert set(df["age_group"].unique()) == set(AGES)


def test_footer_dropped(tmp_path):
    df = parse_age_sex(_make_xlsx(tmp_path), SPEC)
    assert df["month"].isin(["January", "April"]).all()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest tests/data_pipeline/test_age_sex_parser.py -v`
Expected: FAIL with `ModuleNotFoundError`.

- [ ] **Step 3: Write `data_pipeline/parsers/age_sex.py`**

```python
from __future__ import annotations
from pathlib import Path
import pandas as pd
from data_pipeline.config import TableSpec
from data_pipeline.parsers.key_indicator import VALID_MONTHS


def parse_age_sex(path: Path, spec: TableSpec) -> pd.DataFrame:
    raw = pd.read_excel(path, header=None)
    sexes = raw.iloc[2].ffill()        # Both Sexes / Male / Female across 7 cols each
    ages = raw.iloc[3]
    body = raw.iloc[4:].copy()
    body[0] = body[0].ffill()
    body = body[body[1].isin(VALID_MONTHS)]

    records = []
    for col in range(2, raw.shape[1]):
        sex = sexes[col]
        age = ages[col]
        if pd.isna(sex) or pd.isna(age):
            continue
        for _, r in body.iterrows():
            records.append({
                "year": int(r[0]),
                "month": r[1],
                "sex": sex,
                "age_group": age,
                "value_raw": r[col],
            })
    return pd.DataFrame(records,
                        columns=["year", "month", "sex", "age_group", "value_raw"])
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `python -m pytest tests/data_pipeline/test_age_sex_parser.py -v`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add data_pipeline/parsers/age_sex.py tests/data_pipeline/test_age_sex_parser.py
git commit -m "feat(etl): add age-sex parser"
```

---

## Task 4: Cleaning + standard-column normalization

**Files:**
- Create: `data_pipeline/clean.py`
- Test: `tests/data_pipeline/test_clean.py`

**Interfaces:**
- Consumes: a parsed long DataFrame (from Task 2 or 3) plus its `TableSpec`.
- Produces: `clean_long(df: pandas.DataFrame, spec: TableSpec) -> pandas.DataFrame` returning the full standard-column schema: `year, month, month_number, period_type, reference_date, sex, age_group, indicator_name, value, unit, source_table, source_updated_at`. Rules: `value_raw` `.`/blank → NaN; commas stripped → float; `Both sexes`→`Both Sexes`; `month_number` 1–12 (NULL for `Annual`); `period_type` = `annual` if month==`Annual` else `monthly`; `reference_date` = first day of month (NULL for Annual); `age_group` defaults to `"Total"` when absent (key-indicator tables); `indicator_name` defaults to `spec.key` label when absent (age-sex tables use `spec.source_table`-derived name). Helper `to_numeric(v) -> float | None` is also exported.

- [ ] **Step 1: Write the failing test** — `tests/data_pipeline/test_clean.py`

```python
import math
import pandas as pd
from datetime import date
from data_pipeline.config import TableSpec
from data_pipeline.clean import clean_long, to_numeric

KI_SPEC = TableSpec("rates", "x", "key_indicator", "percent", "raw.lfs_rates", [])
AS_SPEC = TableSpec("underemployed", "x", "age_sex", "persons", "raw.underemployed_age_sex")

STD_COLS = ["year", "month", "month_number", "period_type", "reference_date",
            "sex", "age_group", "indicator_name", "value", "unit",
            "source_table", "source_updated_at"]


def test_to_numeric():
    assert to_numeric(".") is None
    assert to_numeric("1,234.5") == 1234.5
    assert to_numeric("64.821") == 64.821
    assert to_numeric(None) is None


def test_key_indicator_clean_schema():
    df_in = pd.DataFrame([
        {"year": 2005, "month": "April", "sex": "Both sexes",
         "indicator_name": "Unemployment Rate", "value_raw": "8.28"},
    ])
    out = clean_long(df_in, KI_SPEC)
    assert list(out.columns) == STD_COLS
    row = out.iloc[0]
    assert row.sex == "Both Sexes"          # normalized
    assert row.age_group == "Total"          # default for key-indicator
    assert row.month_number == 4
    assert row.period_type == "monthly"
    assert row.reference_date == date(2005, 4, 1)
    assert row.value == 8.28
    assert row.unit == "percent"
    assert row.source_table == "raw.lfs_rates"


def test_annual_row_has_null_month_number_and_date():
    df_in = pd.DataFrame([
        {"year": 2005, "month": "Annual", "sex": "Male",
         "indicator_name": "Employment Rate", "value_raw": "90.0"},
    ])
    out = clean_long(df_in, KI_SPEC)
    row = out.iloc[0]
    assert row.period_type == "annual"
    assert row.month_number is None or math.isnan(row.month_number)
    assert row.reference_date is None


def test_age_sex_indicator_name_and_dot_to_null():
    df_in = pd.DataFrame([
        {"year": 2005, "month": "January", "sex": "Female",
         "age_group": "15 - 24 Years Old", "value_raw": "."},
    ])
    out = clean_long(df_in, AS_SPEC)
    row = out.iloc[0]
    assert row.indicator_name == "Underemployed Persons"
    assert row.value is None or (isinstance(row.value, float) and math.isnan(row.value))
    assert row.unit == "persons"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest tests/data_pipeline/test_clean.py -v`
Expected: FAIL with `ModuleNotFoundError: data_pipeline.clean`.

- [ ] **Step 3: Write `data_pipeline/clean.py`**

```python
from __future__ import annotations
from datetime import date
import pandas as pd
from data_pipeline.config import TableSpec

MONTH_NUMBER = {
    "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6,
    "July": 7, "August": 8, "September": 9, "October": 10, "November": 11,
    "December": 12,
}

# Friendly indicator name for age-sex tables, keyed by TableSpec.key
AGE_SEX_INDICATOR = {
    "population": "Population 15 Years and Over",
    "labor_force": "Persons in the Labor Force",
    "employed": "Employed Persons",
    "unemployed": "Unemployed Persons",
    "underemployed": "Underemployed Persons",
    "not_in_labor_force": "Persons Not in the Labor Force",
    "visible_underemployed": "Visibly Underemployed Persons",
    "invisible_underemployed": "Invisibly Underemployed Persons",
}


def to_numeric(v) -> float | None:
    if v is None:
        return None
    s = str(v).strip().replace(",", "")
    if s in (".", "", "nan", "NaN", "None", "-"):
        return None
    try:
        return float(s)
    except ValueError:
        return None


def clean_long(df: pd.DataFrame, spec: TableSpec) -> pd.DataFrame:
    out = pd.DataFrame()
    out["year"] = df["year"].astype(int)
    out["month"] = df["month"]
    out["month_number"] = df["month"].map(MONTH_NUMBER)
    out["period_type"] = df["month"].apply(
        lambda m: "annual" if m == "Annual" else "monthly")
    out["reference_date"] = [
        (date(int(y), MONTH_NUMBER[m], 1) if m in MONTH_NUMBER else None)
        for y, m in zip(df["year"], df["month"])
    ]
    out["sex"] = df["sex"].replace({"Both sexes": "Both Sexes"})
    out["age_group"] = df["age_group"] if "age_group" in df else "Total"
    if "indicator_name" in df:
        out["indicator_name"] = df["indicator_name"]
    else:
        out["indicator_name"] = AGE_SEX_INDICATOR[spec.key]
    out["value"] = df["value_raw"].apply(to_numeric)
    out["unit"] = spec.unit
    out["source_table"] = spec.source_table
    out["source_updated_at"] = pd.Timestamp.utcnow()
    return out[["year", "month", "month_number", "period_type", "reference_date",
                "sex", "age_group", "indicator_name", "value", "unit",
                "source_table", "source_updated_at"]]
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `python -m pytest tests/data_pipeline/test_clean.py -v`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add data_pipeline/clean.py tests/data_pipeline/test_clean.py
git commit -m "feat(etl): add cleaning and standard-column normalization"
```

---

## Task 5: Database schema, models, and Alembic migration

**Files:**
- Create: `backend/app/__init__.py`, `backend/app/db/__init__.py`, `backend/app/db/base.py`, `backend/app/db/session.py`, `backend/app/db/models.py`
- Create: `backend/alembic.ini`, `backend/alembic/env.py`, `backend/alembic/versions/0001_initial_schema.py`
- Test: `tests/conftest.py`, `tests/integration/__init__.py`, `tests/integration/test_schema.py`

**Interfaces:**
- Produces:
  - `backend.app.db.session.engine` (SQLAlchemy Engine from `DATABASE_URL`), `SessionLocal`.
  - `backend.app.db.base.Base` (DeclarativeBase) and `SCHEMAS = ["raw","clean","analytics","ml","auth","logs"]`.
  - ORM model `FactLong` mapping a unified clean fact table `clean.fact_long` with columns matching the standard schema plus `id` PK. (V1 stores all clean facts in one partitioned-by-`source_table` long table for simplicity; per-domain views are created in analytics.) Each row keyed by `(source_table, year, month, sex, age_group, indicator_name)`.
- Consumes: `data_pipeline.config.settings.database_url`.

> Design note: the spec lists many per-domain fact tables. For V1 we implement a single normalized `clean.fact_long` table (same standard columns) — every parsed table lands here distinguished by `source_table`/`indicator_name`. This is DRY, matches the uniform long format, and the analytics layer (Task 7) derives the domain summaries the dashboard needs. Per-domain physical tables can be added in V2 if needed.

- [ ] **Step 1: Write the failing test** — `tests/integration/test_schema.py`

```python
import pytest
from sqlalchemy import text, inspect
from backend.app.db.session import engine
from backend.app.db.base import SCHEMAS


@pytest.fixture(scope="module")
def conn():
    with engine.connect() as c:
        yield c


def test_all_schemas_exist(conn):
    rows = conn.execute(text(
        "select schema_name from information_schema.schemata")).scalars().all()
    for s in SCHEMAS:
        assert s in rows, f"missing schema {s}"


def test_fact_long_table_exists(conn):
    insp = inspect(engine)
    assert insp.has_table("fact_long", schema="clean")


def test_fact_long_columns(conn):
    insp = inspect(engine)
    cols = {c["name"] for c in insp.get_columns("fact_long", schema="clean")}
    expected = {"id", "year", "month", "month_number", "period_type",
                "reference_date", "sex", "age_group", "indicator_name",
                "value", "unit", "source_table", "source_updated_at"}
    assert expected.issubset(cols)
```

- [ ] **Step 2: Write `backend/app/db/base.py`**

```python
from sqlalchemy.orm import DeclarativeBase

SCHEMAS = ["raw", "clean", "analytics", "ml", "auth", "logs"]


class Base(DeclarativeBase):
    pass
```

- [ ] **Step 3: Write `backend/app/db/session.py`**

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from data_pipeline.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, future=True)
```

- [ ] **Step 4: Write `backend/app/db/models.py`**

```python
from datetime import date, datetime
from sqlalchemy import String, Integer, Float, Date, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.db.base import Base


class FactLong(Base):
    __tablename__ = "fact_long"
    __table_args__ = (
        Index("ix_fact_long_lookup", "source_table", "year", "month_number"),
        Index("ix_fact_long_indicator", "indicator_name", "sex", "age_group"),
        {"schema": "clean"},
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    month: Mapped[str] = mapped_column(String(16), nullable=False)
    month_number: Mapped[int | None] = mapped_column(Integer)
    period_type: Mapped[str] = mapped_column(String(16), nullable=False)
    reference_date: Mapped[date | None] = mapped_column(Date)
    sex: Mapped[str] = mapped_column(String(16), nullable=False)
    age_group: Mapped[str] = mapped_column(String(32), nullable=False)
    indicator_name: Mapped[str] = mapped_column(String(80), nullable=False)
    value: Mapped[float | None] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(16), nullable=False)
    source_table: Mapped[str] = mapped_column(String(64), nullable=False)
    source_updated_at: Mapped[datetime] = mapped_column(DateTime)
```

- [ ] **Step 5: Initialize Alembic and write `alembic.ini` + `alembic/env.py`**

Run: `cd backend && alembic init alembic` (then overwrite `env.py`).

`backend/alembic/env.py` (key parts — replace generated file):

```python
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool, text
from alembic import context
from data_pipeline.config import settings
from backend.app.db.base import Base, SCHEMAS
import backend.app.db.models  # noqa: F401  (register models)

config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url)
if config.config_file_name:
    fileConfig(config.config_file_name)
target_metadata = Base.metadata


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.", poolclass=pool.NullPool)
    with connectable.connect() as connection:
        for s in SCHEMAS:
            connection.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{s}"'))
        connection.commit()
        context.configure(connection=connection, target_metadata=target_metadata,
                          include_schemas=True)
        with context.begin_transaction():
            context.run_migrations()


run_migrations_online()
```

In `alembic.ini`, ensure `script_location = alembic` and leave `sqlalchemy.url` blank (set in env.py).

- [ ] **Step 6: Autogenerate the initial migration**

Run: `cd backend && alembic revision --autogenerate -m "initial schema" -rev-id 0001_initial_schema`
Expected: a file `alembic/versions/0001_initial_schema.py` containing `op.create_table("fact_long", schema="clean", ...)`.
Confirm it includes the schema-creation in `env.py` ran (schemas exist) and the table create. If autogenerate misses schemas, that's fine — `env.py` creates them.

- [ ] **Step 7: Apply the migration to NeonDB**

Run: `cd backend && alembic upgrade head`
Expected: `Running upgrade -> 0001_initial_schema`. No error.

- [ ] **Step 8: Write `tests/conftest.py`**

```python
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
```

- [ ] **Step 9: Run schema tests**

Run: `python -m pytest tests/integration/test_schema.py -v`
Expected: 3 passed.

- [ ] **Step 10: Commit**

```bash
git add backend/app backend/alembic backend/alembic.ini tests/conftest.py tests/integration
git commit -m "feat(db): add schemas, FactLong model, and initial Alembic migration"
```

---

## Task 6: Loader (raw + clean.fact_long)

**Files:**
- Create: `data_pipeline/loader.py`
- Test: `tests/integration/test_loader.py`

**Interfaces:**
- Consumes: cleaned long DataFrame (Task 4 output), `engine` (Task 5), `TABLE_REGISTRY`.
- Produces:
  - `load_raw(df_clean: pandas.DataFrame, spec: TableSpec) -> int` — writes the cleaned long rows to `raw.<table>` (per spec.source_table, replacing existing), returns row count.
  - `load_clean(df_clean: pandas.DataFrame) -> int` — appends rows to `clean.fact_long`, returns row count.
  - `parse_and_clean(spec: TableSpec) -> pandas.DataFrame` — dispatches to the right parser by `spec.archetype`, then `clean_long`.
  - `reset_clean() -> None` — truncates `clean.fact_long` for idempotent reloads.

- [ ] **Step 1: Write the failing test** — `tests/integration/test_loader.py`

```python
import pandas as pd
from sqlalchemy import text
from backend.app.db.session import engine
from data_pipeline.config import TABLE_REGISTRY
from data_pipeline.loader import parse_and_clean, load_clean, reset_clean


def _spec(key):
    return next(t for t in TABLE_REGISTRY if t.key == key)


def test_parse_and_clean_rates_nonempty():
    df = parse_and_clean(_spec("rates"))
    assert len(df) > 100
    assert set(df["unit"].unique()) == {"percent"}
    assert "Both Sexes" in df["sex"].unique()
    assert "Both sexes" not in df["sex"].unique()


def test_load_clean_roundtrip():
    reset_clean()
    df = parse_and_clean(_spec("rates"))
    n = load_clean(df)
    with engine.connect() as c:
        count = c.execute(text(
            "select count(*) from clean.fact_long where source_table='raw.lfs_rates'"
        )).scalar()
    assert count == n == len(df)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest tests/integration/test_loader.py -v`
Expected: FAIL with `ModuleNotFoundError: data_pipeline.loader`.

- [ ] **Step 3: Write `data_pipeline/loader.py`**

```python
from __future__ import annotations
import pandas as pd
from sqlalchemy import text
from data_pipeline.config import TableSpec, settings
from data_pipeline.parsers.key_indicator import parse_key_indicator
from data_pipeline.parsers.age_sex import parse_age_sex
from data_pipeline.clean import clean_long
from backend.app.db.session import engine

CLEAN_TABLE = "fact_long"


def parse_and_clean(spec: TableSpec) -> pd.DataFrame:
    path = settings.datasets_dir / spec.filename
    if spec.archetype == "key_indicator":
        parsed = parse_key_indicator(path, spec)
    else:
        parsed = parse_age_sex(path, spec)
    return clean_long(parsed, spec)


def load_raw(df_clean: pd.DataFrame, spec: TableSpec) -> int:
    schema, table = spec.source_table.split(".")
    df_clean.to_sql(table, engine, schema=schema, if_exists="replace", index=False)
    return len(df_clean)


def reset_clean() -> None:
    with engine.begin() as c:
        c.execute(text(f"TRUNCATE TABLE clean.{CLEAN_TABLE} RESTART IDENTITY"))


def load_clean(df_clean: pd.DataFrame) -> int:
    df_clean.to_sql(CLEAN_TABLE, engine, schema="clean",
                    if_exists="append", index=False)
    return len(df_clean)
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `python -m pytest tests/integration/test_loader.py -v`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add data_pipeline/loader.py tests/integration/test_loader.py
git commit -m "feat(etl): add raw + clean loaders with idempotent reset"
```

---

## Task 7: Analytics builder + orchestrator

**Files:**
- Create: `data_pipeline/analytics_builder.py`, `data_pipeline/scripts/__init__.py`, `data_pipeline/scripts/run_etl.py`
- Test: `tests/integration/test_data_quality.py`

**Interfaces:**
- Consumes: populated `clean.fact_long`, `engine`.
- Produces:
  - `build_dashboard_kpis() -> int` — creates/replaces `analytics.dashboard_kpis` (latest monthly value per rate indicator + latest total employed/underemployed levels), returns row count.
  - `build_monthly_labor_summary() -> int` — creates/replaces `analytics.monthly_labor_summary` (one row per reference_date with the four rate indicators as columns, `sex='Both Sexes'`).
  - `run_full_etl() -> dict[str,int]` in `run_etl.py`: resets clean, loops `TABLE_REGISTRY` → `parse_and_clean` → `load_raw` + `load_clean`, then builds analytics; returns per-step counts. `python -m data_pipeline.scripts.run_etl` runs it and prints a summary.

- [ ] **Step 1: Write `data_pipeline/analytics_builder.py`**

```python
from __future__ import annotations
from sqlalchemy import text
from backend.app.db.session import engine

RATE_INDICATORS = ("Labor Force Participation Rate", "Employment Rate",
                   "Unemployment Rate", "Underemployment Rate")


def build_monthly_labor_summary() -> int:
    sql = """
    DROP TABLE IF EXISTS analytics.monthly_labor_summary;
    CREATE TABLE analytics.monthly_labor_summary AS
    SELECT reference_date, year, month_number,
           MAX(value) FILTER (WHERE indicator_name='Labor Force Participation Rate') AS lfpr,
           MAX(value) FILTER (WHERE indicator_name='Employment Rate')        AS employment_rate,
           MAX(value) FILTER (WHERE indicator_name='Unemployment Rate')      AS unemployment_rate,
           MAX(value) FILTER (WHERE indicator_name='Underemployment Rate')   AS underemployment_rate
    FROM clean.fact_long
    WHERE source_table='raw.lfs_rates' AND sex='Both Sexes'
      AND period_type='monthly' AND reference_date IS NOT NULL
    GROUP BY reference_date, year, month_number
    ORDER BY reference_date;
    """
    with engine.begin() as c:
        c.execute(text(sql))
        return c.execute(text("SELECT count(*) FROM analytics.monthly_labor_summary")).scalar()


def build_dashboard_kpis() -> int:
    sql = """
    DROP TABLE IF EXISTS analytics.dashboard_kpis;
    CREATE TABLE analytics.dashboard_kpis AS
    WITH latest AS (
      SELECT indicator_name, value, unit, reference_date,
             ROW_NUMBER() OVER (PARTITION BY indicator_name
                                ORDER BY reference_date DESC NULLS LAST) AS rn
      FROM clean.fact_long
      WHERE sex='Both Sexes' AND age_group='Total'
        AND period_type='monthly' AND value IS NOT NULL
        AND source_table IN ('raw.lfs_rates','raw.lfs_levels')
    )
    SELECT indicator_name, value, unit, reference_date
    FROM latest WHERE rn=1;
    """
    with engine.begin() as c:
        c.execute(text(sql))
        return c.execute(text("SELECT count(*) FROM analytics.dashboard_kpis")).scalar()
```

- [ ] **Step 2: Write `data_pipeline/scripts/run_etl.py`**

```python
from __future__ import annotations
from data_pipeline.config import TABLE_REGISTRY
from data_pipeline.loader import parse_and_clean, load_raw, load_clean, reset_clean
from data_pipeline.analytics_builder import (
    build_monthly_labor_summary, build_dashboard_kpis)


def run_full_etl() -> dict[str, int]:
    counts: dict[str, int] = {}
    reset_clean()
    for spec in TABLE_REGISTRY:
        df = parse_and_clean(spec)
        load_raw(df, spec)
        counts[spec.key] = load_clean(df)
    counts["monthly_labor_summary"] = build_monthly_labor_summary()
    counts["dashboard_kpis"] = build_dashboard_kpis()
    return counts


if __name__ == "__main__":
    result = run_full_etl()
    total = sum(v for k, v in result.items()
                if k not in ("monthly_labor_summary", "dashboard_kpis"))
    print("ETL complete.")
    for k, v in result.items():
        print(f"  {k:28s} {v:>8d}")
    print(f"  {'TOTAL clean rows':28s} {total:>8d}")
```

- [ ] **Step 3: Run the full ETL against NeonDB**

Run: `python -m data_pipeline.scripts.run_etl`
Expected: prints per-table counts, all > 0, plus `monthly_labor_summary` and `dashboard_kpis` counts > 0. No exceptions.

- [ ] **Step 4: Write the failing data-quality test** — `tests/integration/test_data_quality.py`

```python
import pytest
from sqlalchemy import text
from backend.app.db.session import engine


@pytest.fixture(scope="module")
def conn():
    with engine.connect() as c:
        yield c


def test_no_negative_values(conn):
    n = conn.execute(text(
        "SELECT count(*) FROM clean.fact_long WHERE value < 0")).scalar()
    assert n == 0


def test_rates_within_bounds(conn):
    n = conn.execute(text(
        "SELECT count(*) FROM clean.fact_long "
        "WHERE unit='percent' AND value IS NOT NULL AND (value < 0 OR value > 100)"
    )).scalar()
    assert n == 0


def test_sex_labels_normalized(conn):
    rows = conn.execute(text(
        "SELECT DISTINCT sex FROM clean.fact_long")).scalars().all()
    assert set(rows) <= {"Both Sexes", "Male", "Female"}


def test_all_source_tables_present(conn):
    rows = conn.execute(text(
        "SELECT DISTINCT source_table FROM clean.fact_long")).scalars().all()
    assert len(rows) == 10


def test_2026_present_and_partial(conn):
    months = conn.execute(text(
        "SELECT count(DISTINCT month_number) FROM clean.fact_long "
        "WHERE year=2026 AND period_type='monthly'")).scalar()
    assert 0 < months < 12  # partial year


def test_kpis_have_four_rate_indicators(conn):
    n = conn.execute(text(
        "SELECT count(*) FROM analytics.dashboard_kpis "
        "WHERE unit='percent'")).scalar()
    assert n >= 4
```

- [ ] **Step 5: Run data-quality tests**

Run: `python -m pytest tests/integration/test_data_quality.py -v`
Expected: 6 passed. If `test_rates_within_bounds` fails, inspect offending rows — likely an annual row miscoded; fix parser/clean and re-run ETL.

- [ ] **Step 6: Run the full suite**

Run: `python -m pytest -v`
Expected: all parser/clean unit tests + integration tests pass.

- [ ] **Step 7: Commit**

```bash
git add data_pipeline/analytics_builder.py data_pipeline/scripts tests/integration/test_data_quality.py
git commit -m "feat(etl): add analytics builder, ETL orchestrator, and data-quality tests"
```

---

## Self-Review

- **Spec coverage:** §3 data scope → Task 1 registry (10 tables). §4 ETL parse/clean/load/analytics → Tasks 2–7. §5 DB schemas + facts + analytics → Tasks 5, 7 (single `fact_long` + analytics summaries; design-note documents the deliberate simplification of per-domain fact tables for V1). §8 data tests → Task 7. §7 cleaning rules → Task 4. Backend API (§6) and frontend (§7 of spec) are **deliberately out of this plan** — they are Plans B and C.
- **Placeholder scan:** none — every code step contains complete code; commands have expected output.
- **Type consistency:** `parse_key_indicator`/`parse_age_sex` return `value_raw`; `clean_long` consumes `value_raw` and emits the standard 12 columns; `FactLong` columns match those 12 + `id`; loader/analytics reference `clean.fact_long` and `source_table` values from the registry consistently (`raw.lfs_rates`, `raw.lfs_levels`).
- **Deviation noted:** spec listed many per-domain `clean.fact_*` tables; this plan uses one `clean.fact_long` (documented design note in Task 5). Flag for user review.
