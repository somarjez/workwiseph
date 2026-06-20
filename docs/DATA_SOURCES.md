# Data Sources

All data comes from the **Philippine Statistics Authority (PSA) Labor Force Survey (LFS)**,
exported from PSA OpenSTAT. The survey is the official source for Philippine employment,
unemployment, and underemployment statistics.

- **Provider:** Philippine Statistics Authority — OpenSTAT (https://openstat.psa.gov.ph)
- **Survey:** Labor Force Survey (LFS)
- **Coverage:** April 2005 – April 2026 (cadence is quarterly — Jan/Apr/Jul/Oct — through
  2020, then monthly from 2021; some series start later, see the data dictionary)
- **Geography:** Philippines, national
- **Raw files:** the original `.xlsx` exports are kept in `datasets/` and committed to the repo.

## File → table mapping

| Source `.xlsx` (in `datasets/`) | Loaded as |
| --- | --- |
| 1 Levels of Key Employment Indicators | `raw.lfs_levels` |
| 2 Rates Key Employment Indicators | `raw.lfs_rates` |
| 3 Population 15 Years Old and Over … | `raw.population_age_sex` |
| 4 Persons in the Labor Force … | `raw.labor_force_age_sex` |
| 5 Employed Persons by Sex and Age | `raw.employed_age_sex` |
| 6 Unemployed Persons by Sex and Age | `raw.unemployed_age_sex` |
| 7 Underemployed Persons by Sex and Age | `raw.underemployed_age_sex` |
| 8 Persons Not in the Labor Force … | `raw.not_in_labor_force_age_sex` |
| 10 Employed by Major Industry Group | `raw.employed_industry_2009` |
| 12 Employed by Major Occupation Group (2012 PSOC) | `raw.employed_occupation_2012` |
| 13 Employed by Class of Worker | `raw.class_of_worker` |
| 14 Employed by Highest Grade Completed (2017 PSCED) | `raw.education_employed` |
| 15 Underemployed by Highest Grade Completed | `raw.education_underemployed` |
| 16 Average Daily Basic Pay by Industry | `raw.average_pay_industry` |
| 17 Visibly Underemployed by Sex and Age | `raw.visible_underemployed_age_sex` |
| 18 Invisibly Underemployed by Sex and Age | `raw.invisible_underemployed_age_sex` |
| 19 Mean Hours Worked in One Week | `raw.mean_hours_worked` |
| 20 Employed Persons by Hours Worked | `raw.hours_worked` |

Each OpenSTAT export carries an internal reference code (e.g. `1B3GKEI2`) in its footer;
the ETL strips these footer rows on load.

## Archived (not loaded)

PSA changed classification systems over time. To avoid misleading trend joins, the older
classifications are **archived, not merged**: 1994 PSIC industry (2005–2011) and 1992 PSOC
occupation (2005–2016). V1+ uses 2009 PSIC and 2012 PSOC only.

## Refresh

PSA publishes new LFS rounds monthly. Re-running the ETL (`python -m
data_pipeline.scripts.run_etl`, or the admin "Run ETL" trigger, or the monthly Render cron)
re-reads `datasets/` and reloads the database.
