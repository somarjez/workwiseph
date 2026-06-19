Yes, your collected datasets are **complete enough** for a strong intermediate-to-advanced project. You do **not** need more data for the first version. PSA OpenSTAT also confirms that the LFS table list includes these core labor tables with dimensions like year, month, sex, age group, levels, and rates, and the current table listing is updated up to April 2026 in the returned OpenSTAT page. ([OpenSTAT][1])

# Project Name

## **WorkWise PH: Labor Market and Underemployment Analytics Dashboard**

**Main goal:**
Build a Philippine labor analytics platform that tracks employment, unemployment, underemployment, labor participation, hours worked, education mismatch, pay trends, industry shifts, and short-term labor indicator forecasts.

This should not just be a dashboard. Make it a **data analytics web app** with:

* Data cleaning pipeline
* PostgreSQL database using NeonDB
* Backend API on Render
* Frontend dashboard on Vercel
* Forecasting and anomaly detection
* Secure admin/data upload system
* Rate limiting and proper app layering

---

# 1. Dataset Organization

You collected many tables, so organize them into **core**, **analysis expansion**, and **advanced modules**.

## Core Datasets for Version 1

Use these first:

| Dataset                                                   | Purpose                                                                    |
| --------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Levels of Key Employment Indicators**                   | Main counts: labor force, employed, unemployed, underemployed              |
| **Rates Key Employment Indicators**                       | Main rates: LFPR, employment rate, unemployment rate, underemployment rate |
| **Population 15 Years Old and Over by Sex and Age Group** | Working-age population base                                                |
| **Persons in the Labor Force by Sex and Age Group**       | Labor force participation by age/sex                                       |
| **Employed Persons by Sex and Age Group**                 | Employment count by age/sex                                                |
| **Unemployed Persons by Sex and Age Group**               | Unemployment count by age/sex                                              |
| **Underemployed Persons by Sex and Age Group**            | Main underemployment analysis                                              |
| **Persons Not in the Labor Force by Sex and Age Group**   | Labor force exclusion / inactive population analysis                       |

These are enough to build the first working dashboard.

## Expansion Datasets for Version 2

Use these after the core system works:

| Dataset                                                        | Purpose                                            |
| -------------------------------------------------------------- | -------------------------------------------------- |
| **Employed Persons by Major Industry Group, 2009 PSIC**        | Industry employment shifts from 2012–2026          |
| **Employed Persons by Major Occupation Group, 2012 PSOC**      | Job category trends from 2016–2026                 |
| **Employed Persons by Class of Worker**                        | Wage workers, self-employed, unpaid family workers |
| **Number of Employed Persons by Highest Grade Completed**      | Employment by education level, 2023–2026           |
| **Number of Underemployed Persons by Highest Grade Completed** | Underemployment by education level, 2023–2026      |
| **Average Daily Basic Pay by Major Industry Group**            | Pay trend by sector, 2016–2026                     |
| **Visible Underemployment**                                    | Workers wanting more hours                         |
| **Invisible Underemployment**                                  | Workers wanting better income/job conditions       |
| **Mean Hours Worked in One Week**                              | Labor quality and workload trend                   |
| **Employed Persons by Hours Worked**                           | Less than 40 hours vs 40 hours and over            |

## Archive / Optional Historical Datasets

Be careful with these:

| Dataset                                         | Recommendation                                                       |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| **Industry Group, 1994 PSIC Code: 2005–2011**   | Do not merge immediately with 2009 PSIC. Keep as historical archive. |
| **Occupation Group, 1992 PSOC Code: 2005–2016** | Do not merge immediately with 2012 PSOC. Keep as historical archive. |

The reason is that the industry and occupation classifications changed. If you merge them directly, your trend chart may become misleading.

---

# 2. Main Modules of WorkWise PH

## Module 1: Labor Market Overview

Shows the main national labor indicators.

**Charts:**

* Labor Force Participation Rate over time
* Employment Rate over time
* Unemployment Rate over time
* Underemployment Rate over time
* Employed, unemployed, and underemployed persons count

**Main dataset:**

* Rates Key Employment Indicators
* Levels of Key Employment Indicators

---

## Module 2: Underemployment Deep Dive

This is the identity of your project.

**Questions answered:**

* Is underemployment improving or worsening?
* Which sex has higher underemployment?
* Which age group has higher underemployment?
* Are more workers visibly or invisibly underemployed?
* Is underemployment related to fewer hours worked?

**Datasets:**

* Underemployed Persons by Sex and Age Group
* Visible Underemployment
* Invisible Underemployment
* Mean Hours Worked
* Employed Persons by Hours Worked

---

## Module 3: Age and Gender Labor Gap

This makes your dashboard more analytical.

**Questions answered:**

* Which age group has the highest unemployment?
* Are young workers more vulnerable?
* Is there a male-female gap in labor force participation?
* Are older workers still participating in the labor force?

**Datasets:**

* Population 15 Years Old and Over
* Persons in the Labor Force
* Employed Persons
* Unemployed Persons
* Underemployed Persons
* Persons Not in Labor Force

---

## Module 4: Industry and Occupation Trends

This adds business and policy relevance.

**Questions answered:**

* Which industries employ the most workers?
* Which sectors are growing or shrinking?
* Which occupations are increasing?
* Are workers shifting toward services, agriculture, or industry?

**Datasets:**

* Employed Persons by Major Industry Group, 2009 PSIC
* Employed Persons by Major Occupation Group, 2012 PSOC
* Average Daily Basic Pay by Major Industry Group

---

## Module 5: Education and Underemployment

This makes the project more impressive because it shows possible skills mismatch.

**Questions answered:**

* Are college graduates underemployed?
* Which education group has the largest underemployed count?
* Does higher education always lead to better employment outcomes?

**Datasets:**

* Employed Persons by Highest Grade Completed
* Underemployed Persons by Highest Grade Completed

Since this only covers 2023–2026, use it as a modern snapshot module, not a long-term historical module.

---

## Module 6: Forecasting and Alerts

This turns the project from a basic dashboard into an analytics system.

**Forecast targets:**

* Unemployment Rate
* Underemployment Rate
* Employment Rate
* Labor Force Participation Rate
* Underemployed Persons count

**Outputs:**

* Next 3-month or 6-month forecast
* Confidence range
* Trend direction: increasing, decreasing, stable
* Anomaly flag for unusual months

---

# 3. Do You Need Training?

## Yes, but not deep learning training.

You do **not** need to train a large model or collect labeled data manually. This is not like image classification or NLP.

For WorkWise PH, “training” means training **statistical / machine learning models** using the historical labor data from 2005–2026.

## What You Should Train

| Model Type                |  Needed? | Purpose                                                               |
| ------------------------- | -------: | --------------------------------------------------------------------- |
| Descriptive analytics     |      Yes | Trends, averages, rankings                                            |
| Forecasting model         |      Yes | Predict next labor indicator values                                   |
| Anomaly detection         |      Yes | Detect unusual labor market months                                    |
| Clustering                | Optional | Group months/periods by labor condition                               |
| Deep learning             |       No | Too much for this dataset and unnecessary                             |
| Supervised classification | Optional | Only if you create categories like stable/risky/critical labor period |

## Recommended Training Approach

### Model 1: Baseline Forecast

Start simple.

Use:

* Moving average
* Seasonal naive forecast
* Previous-year same-month forecast

This gives you a comparison model.

### Model 2: Statistical Forecasting

Use:

* SARIMA
* Exponential Smoothing / ETS

Best for monthly time-series data.

### Model 3: Machine Learning Forecast

Use:

* Random Forest Regressor
* Gradient Boosting Regressor
* XGBoost, optional

Use engineered features like:

* year
* month number
* quarter
* previous month value
* previous 3-month average
* previous 6-month average
* year-over-year change
* sex
* age group, where applicable

## Training Split

Use monthly data only.

Do **not** train on “Annual” rows because those are aggregate summaries and can duplicate the monthly pattern.

Suggested split:

| Set        | Years           |
| ---------- | --------------- |
| Training   | 2005–2021       |
| Validation | 2022–2023       |
| Test       | 2024–April 2026 |

Use rolling validation if you want a more defensible time-series evaluation.

## Metrics

Use:

| Metric               | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| MAE                  | Easy-to-understand average error                         |
| RMSE                 | Penalizes large mistakes                                 |
| MAPE                 | Percentage error, useful for rates                       |
| Directional Accuracy | Checks if the model predicts increase/decrease correctly |

---

# 4. Recommended Tech Stack

## Frontend

Use:

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**
* **Recharts or Plotly**
* **Map is not required**

Deploy on:

* **Vercel**

Vercel supports environment variables per environment, and its docs describe them as encrypted key-value pairs configured outside source code. Use this for frontend settings like your backend API URL, not database credentials. ([Vercel][2])

## Backend

Use:

* **FastAPI**
* **Python**
* **Pandas**
* **SQLAlchemy**
* **Pydantic**
* **scikit-learn**
* **statsmodels**
* **joblib**

Deploy on:

* **Render Web Service**

Render supports web services and other service types such as background workers and cron jobs. ([Render][3])

## Database

Use:

* **PostgreSQL**
* **NeonDB**
* **SQLAlchemy / Alembic migrations**

Neon supports pooled connection strings through the Neon Console by enabling the connection pooling toggle, which is useful for app/serverless-style deployments. ([Neon][4])

## Scheduled Data Refresh

Use:

* **Render Cron Job**

Render has Cron Jobs that run periodically on a schedule you define, which is useful for scheduled ETL, dataset refresh, or model retraining. ([Render][5])

---

# 5. System Architecture

```text
User
  ↓
Vercel Frontend
  - Next.js dashboard
  - Charts
  - Filters
  - Forecast views
  - Admin upload page
  ↓
Render Backend API
  - FastAPI
  - Authentication middleware
  - Rate limiting
  - Analytics endpoints
  - Forecast endpoints
  - Data upload endpoints
  ↓
NeonDB PostgreSQL
  - Clean labor tables
  - Forecast results
  - Model metrics
  - Data source audit logs
  ↓
Render Cron Job
  - ETL refresh
  - Model retraining
  - Forecast generation
```

---

# 6. Database Plan for NeonDB

## Main Schemas

Use separate schemas so your database stays clean.

```sql
raw
clean
analytics
ml
auth
logs
```

## Recommended Tables

### Raw Tables

Store uploaded/exported PSA tables as close to original as possible.

```text
raw.lfs_levels
raw.lfs_rates
raw.population_age_sex
raw.labor_force_age_sex
raw.employed_age_sex
raw.unemployed_age_sex
raw.not_in_labor_force_age_sex
raw.underemployed_age_sex
raw.visible_underemployed_age_sex
raw.invisible_underemployed_age_sex
raw.employed_industry_2009
raw.employed_occupation_2012
raw.class_of_worker
raw.education_employed
raw.education_underemployed
raw.average_pay_industry
raw.mean_hours_worked
raw.hours_worked
```

### Dimension Tables

```text
clean.dim_date
clean.dim_sex
clean.dim_age_group
clean.dim_indicator
clean.dim_industry
clean.dim_occupation
clean.dim_education
clean.dim_worker_class
```

### Fact Tables

```text
clean.fact_key_indicator_levels
clean.fact_key_indicator_rates
clean.fact_population_age_sex
clean.fact_labor_force_age_sex
clean.fact_employed_age_sex
clean.fact_unemployed_age_sex
clean.fact_underemployed_age_sex
clean.fact_underemployment_type
clean.fact_employed_industry
clean.fact_employed_occupation
clean.fact_worker_class
clean.fact_education_employment
clean.fact_education_underemployment
clean.fact_average_pay_industry
clean.fact_hours_worked
```

### Analytics Tables

```text
analytics.monthly_labor_summary
analytics.age_gender_summary
analytics.underemployment_summary
analytics.industry_summary
analytics.education_summary
analytics.dashboard_kpis
```

### ML Tables

```text
ml.model_registry
ml.training_runs
ml.forecast_results
ml.anomaly_results
ml.model_metrics
```

### Logs and Security Tables

```text
logs.api_request_logs
logs.data_upload_logs
logs.etl_run_logs
logs.error_logs
auth.users
auth.sessions
```

---

# 7. Data Cleaning Rules

## Important Cleaning Rules

| Issue                                           | Rule                                                           |
| ----------------------------------------------- | -------------------------------------------------------------- |
| Month contains “Annual”                         | Keep for annual dashboard, exclude from monthly model training |
| Values may contain commas                       | Convert to numeric                                             |
| Missing months                                  | Keep missing as null, do not invent values immediately         |
| Sex labels differ: “Both sexes” vs “Both Sexes” | Normalize to `Both Sexes`                                      |
| Total age group                                 | Keep but separate from individual age groups                   |
| Industry old vs new codes                       | Do not merge 1994 PSIC and 2009 PSIC in V1                     |
| Occupation old vs new codes                     | Do not merge 1992 PSOC and 2012 PSOC in V1                     |
| Rates vs levels                                 | Store separately to avoid mixing percent and counts            |
| 2026 incomplete year                            | Mark as partial year                                           |

## Standard Columns

Every cleaned table should have:

```text
id
year
month
month_number
period_type
reference_date
sex
age_group
indicator_name
value
unit
source_table
source_updated_at
created_at
updated_at
```

For rates:

```text
unit = percent
```

For levels:

```text
unit = persons
```

For pay:

```text
unit = PHP
```

---

# 8. Backend API Plan

## Public API Endpoints

```text
GET /api/health
GET /api/kpis
GET /api/labor/rates
GET /api/labor/levels
GET /api/labor/age-sex
GET /api/underemployment/summary
GET /api/underemployment/visible-invisible
GET /api/industry/employment
GET /api/occupation/employment
GET /api/education/employment
GET /api/pay/industry
GET /api/hours-worked
GET /api/forecast
GET /api/anomalies
```

## Admin API Endpoints

```text
POST /api/admin/upload
POST /api/admin/etl/run
POST /api/admin/models/train
POST /api/admin/models/forecast
GET /api/admin/logs
```

## API Response Example

```json
{
  "indicator": "Underemployment Rate",
  "sex": "Both Sexes",
  "period": "Monthly",
  "data": [
    {
      "year": 2026,
      "month": "April",
      "value": 13.0,
      "unit": "percent"
    }
  ]
}
```

---

# 9. Frontend Dashboard Pages

## Page 1: Home / Overview

Cards:

* Latest Employment Rate
* Latest Unemployment Rate
* Latest Underemployment Rate
* Latest Labor Force Participation Rate
* Total Employed Persons
* Total Underemployed Persons

Charts:

* Labor indicators over time
* Employment vs unemployment count
* Underemployment rate trend

---

## Page 2: Underemployment

Charts:

* Underemployment Rate by sex
* Underemployed persons by age group
* Visible vs invisible underemployment
* Underemployment vs hours worked

---

## Page 3: Age and Gender

Charts:

* Labor force by age group
* Employment by age group
* Unemployment by age group
* Male vs female participation gap

---

## Page 4: Industry and Occupation

Charts:

* Top industries by employment
* Industry employment trend
* Top occupations by employment
* Pay by industry

---

## Page 5: Education

Charts:

* Employed persons by highest grade completed
* Underemployed persons by highest grade completed
* Underemployment share by education group

---

## Page 6: Forecasting

Charts:

* Actual vs predicted unemployment rate
* Actual vs predicted underemployment rate
* Forecast confidence range
* Model performance metrics

---

## Page 7: Admin

Features:

* Upload new CSV
* Run ETL
* Trigger model training
* View data refresh history
* View API logs

---

# 10. Development Phases

## Phase 1: Project Setup

**Goal:** Prepare repository and development environment.

Tasks:

* Create GitHub repository
* Create frontend folder
* Create backend folder
* Create data pipeline folder
* Set up `.env.example`
* Add README
* Add project license
* Add folder structure

Recommended structure:

```text
workwise-ph/
│
├── frontend/
│   └── nextjs app
│
├── backend/
│   └── fastapi app
│
├── data_pipeline/
│   ├── raw/
│   ├── processed/
│   ├── scripts/
│   └── notebooks/
│
├── models/
│   ├── artifacts/
│   └── metrics/
│
├── database/
│   ├── migrations/
│   └── schema.sql
│
└── README.md
```

---

## Phase 2: Data Audit and Documentation

**Goal:** Document all collected datasets before coding.

Tasks:

* List all tables
* Record date coverage
* Record dimensions
* Record units
* Identify duplicate or overlapping tables
* Separate monthly and annual rows
* Mark classification changes: PSIC 1994 vs 2009, PSOC 1992 vs 2012

Output:

```text
DATA_DICTIONARY.md
DATA_SOURCES.md
DATA_CLEANING_RULES.md
```

---

## Phase 3: NeonDB Database Setup

**Goal:** Create database and schemas.

Tasks:

* Create NeonDB project
* Create database: `workwise_ph`
* Create schemas: `raw`, `clean`, `analytics`, `ml`, `logs`, `auth`
* Create tables
* Add indexes
* Add migrations

Use environment variables:

```env
DATABASE_URL=
DATABASE_URL_POOLER=
APP_ENV=development
```

Use the pooled connection string for deployed services when connection volume may increase. Neon’s docs describe connection pooling as available through the Connect flow in the Neon Console. ([Neon][4])

---

## Phase 4: ETL Pipeline

**Goal:** Convert collected PSA CSV files into clean database tables.

Tasks:

* Read raw CSV files
* Normalize column names
* Clean values
* Convert dates
* Convert numeric fields
* Add `source_table`
* Add `source_updated_at`
* Load raw tables
* Transform into clean fact tables
* Create analytics summary tables

ETL scripts:

```text
load_raw_data.py
clean_lfs_rates.py
clean_lfs_levels.py
clean_age_sex_tables.py
clean_industry_tables.py
build_dashboard_tables.py
```

---

## Phase 5: Exploratory Data Analysis

**Goal:** Understand trends before building the app.

Questions to answer:

* What years had the highest unemployment rate?
* What years had the highest underemployment rate?
* Which sex had consistently higher labor force participation?
* Which age group had the highest unemployment?
* Did underemployment move with hours worked?
* Which industry employed the most workers?
* Which education group had high underemployment?

Outputs:

```text
EDA_REPORT.ipynb
EDA_FINDINGS.md
```

---

## Phase 6: Model Training

**Goal:** Add forecasting and anomaly detection.

Train these:

| Target                         | Model                        |
| ------------------------------ | ---------------------------- |
| Unemployment Rate              | SARIMA / ETS / Random Forest |
| Underemployment Rate           | SARIMA / ETS / Random Forest |
| Employment Rate                | SARIMA / ETS                 |
| Labor Force Participation Rate | SARIMA / ETS                 |
| Underemployed Persons Count    | SARIMA / Random Forest       |

Anomaly detection:

| Method               | Use                             |
| -------------------- | ------------------------------- |
| Rolling z-score      | Simple unusual month detection  |
| STL residual anomaly | Better for seasonal time series |
| Isolation Forest     | Optional ML anomaly detection   |

Artifacts to save:

```text
models/artifacts/unemployment_rate_model.joblib
models/artifacts/underemployment_rate_model.joblib
models/artifacts/employment_rate_model.joblib
models/metrics/model_metrics.json
```

Store results in:

```text
ml.training_runs
ml.model_metrics
ml.forecast_results
ml.anomaly_results
```

---

## Phase 7: FastAPI Backend Development

**Goal:** Build the API that serves dashboard data.

Tasks:

* Set up FastAPI
* Connect to NeonDB
* Create database service layer
* Create analytics service layer
* Create forecast service layer
* Create API routes
* Add validation using Pydantic
* Add error handling
* Add logging

Layering:

```text
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── rate_limit.py
│   ├── db/
│   │   ├── session.py
│   │   └── models.py
│   ├── repositories/
│   │   └── labor_repository.py
│   ├── services/
│   │   ├── labor_service.py
│   │   ├── forecast_service.py
│   │   └── admin_service.py
│   ├── routers/
│   │   ├── labor.py
│   │   ├── underemployment.py
│   │   ├── forecast.py
│   │   └── admin.py
│   └── schemas/
│       └── responses.py
```

---

## Phase 8: Next.js Frontend Development

**Goal:** Build a clean portfolio-ready dashboard.

Tasks:

* Create dashboard layout
* Add sidebar navigation
* Add filters: year, month, sex, age group
* Add chart components
* Add KPI cards
* Add loading states
* Add empty states
* Add error states
* Add export button for CSV/PNG if possible

Suggested pages:

```text
/
 /overview
 /underemployment
 /age-gender
 /industry
 /education
 /forecasting
 /admin
```

Deploy frontend on Vercel. Keep only frontend-safe variables there, such as `NEXT_PUBLIC_API_URL`; do not put your NeonDB connection string in the browser/frontend environment. Vercel’s environment variable docs describe environment-specific key-value configuration outside source code. ([Vercel][2])

---

## Phase 9: Security and Rate Limiting

**Goal:** Make the app look production-ready.

## Security Rules

| Area                 | Rule                                            |
| -------------------- | ----------------------------------------------- |
| Database credentials | Store only in Render/Neon environment variables |
| Frontend             | Never expose `DATABASE_URL`                     |
| Admin upload         | Require login                                   |
| API access           | Add rate limiting                               |
| CORS                 | Allow only your Vercel domain                   |
| File upload          | CSV only, max file size limit                   |
| SQL                  | Use SQLAlchemy parameterized queries            |
| Logs                 | Do not log database passwords or tokens         |
| Secrets              | Use `.env`, never commit secrets                |

Render’s docs recommend environment variables for runtime configuration and for protecting credentials like API keys and database connection strings from being committed to source code. ([Render][6])

## Suggested Rate Limits

| Endpoint Type        | Limit                     |
| -------------------- | ------------------------- |
| Public dashboard API | 60 requests/minute/IP     |
| Forecast API         | 20 requests/minute/IP     |
| Admin upload         | 5 requests/minute/account |
| Login                | 5 attempts/15 minutes     |
| ETL trigger          | Admin only                |

---

## Phase 10: Render Deployment

**Goal:** Deploy backend and scheduled jobs.

## Render Web Service

Deploy:

```text
backend/
```

Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Environment variables:

```env
APP_ENV=production
DATABASE_URL_POOLER=
SECRET_KEY=
CORS_ORIGINS=https://your-vercel-domain.vercel.app
RATE_LIMIT_ENABLED=true
```

## Render Cron Job

Use this for:

* Monthly data refresh
* Rebuilding summary tables
* Retraining models
* Generating forecasts

Example commands:

```bash
python data_pipeline/scripts/run_etl.py
python data_pipeline/scripts/train_models.py
python data_pipeline/scripts/generate_forecasts.py
```

Render’s Cron Jobs are designed for scheduled periodic tasks, and you can create them from a Git repository or Docker image in the Render dashboard. ([Render][5])

---

## Phase 11: Testing

**Goal:** Prevent broken charts and incorrect calculations.

## Backend Tests

Test:

* API health check
* Database connection
* KPI endpoint
* Filtered labor rate endpoint
* Forecast endpoint
* Admin upload validation
* Rate limiting
* Authentication

## Data Tests

Test:

* No negative employment values
* Rates are between 0 and 100
* Annual rows are excluded from monthly model training
* Sex labels are normalized
* Age groups are consistent
* 2026 is marked as incomplete
* Required columns exist

## Frontend Tests

Test:

* Dashboard loads
* Filters work
* Charts render
* Empty states display
* API errors show friendly messages

---

# 12. Final Development Roadmap

## Phase Summary

| Phase | Title               | Output                                   |
| ----- | ------------------- | ---------------------------------------- |
| 1     | Project Setup       | Repo, folders, README                    |
| 2     | Data Audit          | Data dictionary and cleaning rules       |
| 3     | NeonDB Setup        | PostgreSQL schema and tables             |
| 4     | ETL Pipeline        | Clean data loaded into DB                |
| 5     | EDA                 | Findings and first charts                |
| 6     | Model Training      | Forecast and anomaly models              |
| 7     | Backend API         | FastAPI service on Render                |
| 8     | Frontend Dashboard  | Next.js app on Vercel                    |
| 9     | Security            | Auth, CORS, rate limits, secrets         |
| 10    | Deployment          | Vercel + Render + NeonDB                 |
| 11    | Testing             | Unit, data, API, frontend tests          |
| 12    | Portfolio Packaging | README, screenshots, demo, documentation |

---

# 13. Recommended Versioning

## Version 1: MVP

Build this first.

Features:

* Overview dashboard
* Underemployment dashboard
* Age and sex filters
* Rates and levels charts
* NeonDB connected
* FastAPI backend
* Vercel frontend
* Render deployment

Datasets:

* Levels Key Employment Indicators
* Rates Key Employment Indicators
* Population
* Labor Force
* Employed
* Unemployed
* Underemployed
* Not in Labor Force

## Version 2: Advanced Analytics

Add:

* Industry trends
* Occupation trends
* Class of worker
* Education module
* Pay module
* Hours worked module

## Version 3: Machine Learning

Add:

* Forecasting
* Anomaly detection
* Model metrics
* Forecast confidence intervals
* Admin retraining button

## Version 4: Production Polish

Add:

* Admin login
* CSV upload
* Data refresh logs
* Export reports
* Dark mode
* Public portfolio landing page
* Technical documentation

---

# 14. Best Final Scope

For your portfolio, the final app should say:

> **WorkWise PH is a Philippine labor market analytics dashboard that transforms PSA Labor Force Survey tables into interactive insights on employment, unemployment, underemployment, labor participation, education, industry, pay, and working hours. The system includes a PostgreSQL-backed data pipeline, interactive dashboard, forecasting models, anomaly detection, and secure deployment using NeonDB, Render, and Vercel.**

That sounds much stronger than “I made a dashboard.”

Your best first build should be:

# **WorkWise PH V1: Underemployment and Labor Trend Dashboard**

Then expand it into forecasting and advanced analytics after the dashboard works.

[1]: https://openstat.psa.gov.ph/PXWeb/pxweb/en/DB/DB__1B__LFS/?rxid=1a40cbb7-08f3-4a6f-9e2e-7b3a44e1325f&tablelist=true&utm_source=chatgpt.com "Labor Force Survey (LFS) - PX-Web - Select table"
[2]: https://vercel.com/docs/environment-variables?utm_source=chatgpt.com "Environment variables"
[3]: https://render.com/docs/service-types?utm_source=chatgpt.com "Render Service Types"
[4]: https://neon.com/docs/connect/connection-pooling?utm_source=chatgpt.com "Connection pooling - Neon Docs"
[5]: https://render.com/docs/cronjobs?utm_source=chatgpt.com "Cron Jobs"
[6]: https://render.com/docs/configure-environment-variables?utm_source=chatgpt.com "Environment Variables and Secrets"
