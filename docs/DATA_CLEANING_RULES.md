# Data Cleaning Rules

The rules the ETL applies when turning PSA OpenSTAT `.xlsx` exports into `clean.fact_long`.
Implemented in `data_pipeline/parsers/*` and `data_pipeline/clean.py`.

## Parsing (per source shape)

PSA tables come in four shapes; each has a dedicated parser:

- **Key-indicator** (rates, levels): two header rows — indicator group × sex.
- **Age-sex**: two header rows — sex × age band.
- **Category** (industry, occupation, education, class-of-worker, hours): one header row of
  categories.
- **Pay matrix**: transposed — years/months across columns, industries down rows.

Title rows, blank rows, and footer rows (`Database:`, `OpenSTAT`, `Internal reference
code:`, the code itself) are dropped. The year column is forward-filled (it appears only on
the first month of each year).

## Value & label normalization

| Issue | Rule |
| --- | --- |
| Missing values shown as `.` | → `NULL` (kept missing; never invented) |
| Thousands separators in numbers | commas stripped, parsed to float |
| Sex label casing (`Both sexes` vs `Both Sexes`) | normalized to `Both Sexes` |
| `Annual` rows | kept, marked `period_type='annual'`, `month_number`/`reference_date` null |
| Monthly rows | `period_type='monthly'`, `reference_date` = first of month |
| Pay value of `0` | treated as a "not yet available" sentinel → `NULL` (daily pay is never 0) |
| Industry/pay category indentation (`..`, `....`) | leading dots/spaces stripped |
| Category tables (no sex/age) | default `sex='Both Sexes'`, `age_group='Total'` |

## Units

- Rates → `unit='percent'`; level counts → `unit='persons'` (values are in **thousands**);
  pay → `unit='PHP'`; mean hours → `unit='hours'`.
- Rates and levels are stored separately (never mixed) so percent and count values don't collide.

## Coverage caveats preserved (not "fixed")

- **Irregular cadence:** quarterly (Jan/Apr/Jul/Oct) through 2020, monthly from 2021. The
  pipeline keeps the gaps as missing rather than interpolating; forecasting trains only on
  the continuous monthly era (2021+).
- **Partial 2026:** only the early months of 2026 carry values; the rest remain null.
- **Classification breaks:** 2009 PSIC / 2012 PSOC / 2017 PSCED are kept on their own
  source tables; older classifications are archived, not merged.

## Data-quality guarantees (tested)

`tests/integration/test_data_quality.py` asserts, against the loaded database: no negative
values; rates within 0–100; sex labels normalized to the three allowed values; all 18
source tables present; pay rows are positive PHP; mean hours within 1–80; 2026 is partial;
industry/occupation/pay/education rows carry a category.
