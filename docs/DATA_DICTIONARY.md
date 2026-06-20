# Data Dictionary

All 18 source tables are normalized into one long fact table, **`clean.fact_long`**,
distinguished by `source_table` / `indicator_name` (and `category` for the V2 tables).
Analytics summaries live in `analytics.*`; model output in `ml.*`.

## `clean.fact_long` columns

| Column | Type | Notes |
| --- | --- | --- |
| `id` | int PK | |
| `year` | int | calendar year |
| `month` | text | full month name, or `Annual` for annual rows |
| `month_number` | int / null | 1–12; null for `Annual` |
| `period_type` | text | `monthly` or `annual` |
| `reference_date` | date / null | first of month; null for `Annual` |
| `sex` | text | `Both Sexes` / `Male` / `Female` (category tables use `Both Sexes`) |
| `age_group` | text | `Total` + six bands; `Total` for non-age tables |
| `category` | text / null | industry / occupation / education / worker-class / hours band (V2 tables) |
| `indicator_name` | text | the measure, e.g. `Unemployment Rate`, `Employed Persons by Industry` |
| `value` | float / null | the observation; null for missing months |
| `unit` | text | `percent`, `persons` (in **thousands**), `PHP`, or `hours` |
| `source_table` | text | provenance key (see below) |
| `source_updated_at` | timestamp | load time |

> **Units:** rates are percent; level counts are in **thousands of persons**; pay is
> Philippine pesos (daily basic pay); mean hours is hours per week.

## Source tables

| `source_table` | Indicator(s) | Dimension | Unit | Coverage / cadence |
| --- | --- | --- | --- | --- |
| `raw.lfs_rates` | LFPR, Employment, Unemployment, Underemployment rate | sex | percent | 2005–2026; quarterly pre-2021, monthly after |
| `raw.lfs_levels` | Population 15+, Labor force, Employed, Unemployed, Underemployed | sex | persons (000s) | 2005–2026 |
| `raw.population_age_sex` | Population 15+ | sex × age | persons (000s) | 2005–2026 |
| `raw.labor_force_age_sex` | Persons in labor force | sex × age | persons (000s) | 2005–2026 |
| `raw.employed_age_sex` | Employed persons | sex × age | persons (000s) | 2005–2026 |
| `raw.unemployed_age_sex` | Unemployed persons | sex × age | persons (000s) | 2005–2026 |
| `raw.underemployed_age_sex` | Underemployed persons | sex × age | persons (000s) | 2005–2026 |
| `raw.not_in_labor_force_age_sex` | Persons not in labor force | sex × age | persons (000s) | 2005–2026 |
| `raw.visible_underemployed_age_sex` | Visibly underemployed | sex × age | persons (000s) | 2005–2026 |
| `raw.invisible_underemployed_age_sex` | Invisibly underemployed | sex × age | persons (000s) | 2005–2026 |
| `raw.employed_industry_2009` | Employed by industry (2009 PSIC) | industry category | persons (000s) | 2012–2026 |
| `raw.employed_occupation_2012` | Employed by occupation (2012 PSOC) | occupation category | persons (000s) | 2016–2026 |
| `raw.average_pay_industry` | Avg daily basic pay | industry category | PHP | 2016–2026 |
| `raw.education_employed` | Employed by education (2017 PSCED) | education category | persons (000s) | 2023–2026 |
| `raw.education_underemployed` | Underemployed by education | education category | persons (000s) | 2023–2026 |
| `raw.class_of_worker` | Employed by class of worker | worker-class category | persons (000s) | 2005–2026 |
| `raw.hours_worked` | Employed by hours worked | hours-band category | persons (000s) | 2005–2026 |
| `raw.mean_hours_worked` | Mean hours worked / week | (single series) | hours | 2005–2026 |

## Age groups & classification breaks

Age bands: `Total`, `15 - 24`, `25 - 34`, `35 - 44`, `45 - 54`, `55 - 64`, `65 and over`.

Classification breaks are kept separate (not merged): industry uses **2009 PSIC** (the
1994-PSIC archive is excluded), occupation uses **2012 PSOC** (the 1992-PSOC archive is
excluded), education uses **2017 PSCED**. Merging across these would create misleading
trend joins.
