# WorkWise PH Forecast-First Redesign

## Purpose

WorkWise PH will become a public forecasting product for analysts and students. The site must turn existing Philippine labor forecasts into a defensible short-term outlook rather than stop at charts and filters.

## Experience

The home page is a full-width editorial landing page without the dashboard sidebar. It introduces the product, shows a live labor outlook preview, explains the PSA data and model limitations, links into the Outlook Builder, and credits creator Jezreel Ramos. The creator summary should focus on his fourth-year BS Computer Science (Intelligent Systems) background in the Philippines and his work across data analysis, web development, project management, and AI/machine learning, with GitHub and email links.

The existing `/forecasting` route becomes the Outlook Builder. A visitor selects one of the four existing headline rates, a 3- or 6-month target, and a threshold from 0 to 100. The page reports the latest observation, target forecast, percentage-point change, direction, confidence interval, relationship to the threshold, recent anomalies, and backtest quality. Changes under 0.1 percentage points are stable. A range is above a threshold only when its lower bound exceeds it, below only when its upper bound is lower, and overlapping otherwise.

The indicator, model, horizon, threshold, and anomaly method remain shareable URL parameters. An invalid URL value falls back to the supported default. Changing indicator resets the threshold to the latest observation rounded to one decimal. Model and anomaly controls live in a secondary Method & Validation section. The generated brief is printable and explicitly describes the result as a statistical projection, not a causal prediction, probability, or recommendation.

Existing reports, the Data Explorer, and topic dashboards stay available as supporting analysis.

## System Changes

The existing forecast and anomaly API contracts remain backward compatible. Outlook interpretation is a pure, unit-tested frontend derivation from those responses.

The admin feature is removed end-to-end: frontend route and navigation, API endpoints, auth/JWT helpers, upload and web-triggered jobs, user and log models, settings, dependencies, deployment variables, documentation, and tests. A forward Alembic migration drops `auth.users` and `logs.etl_run_logs`. The empty legacy schemas remain for replaying the existing migration history. The monthly Render cron and CLI commands remain the update mechanism.

## Quality Requirements

The landing page and Outlook Builder must be responsive, keyboard accessible, compatible with both themes, and honest in loading, empty, and error states. New derivation behavior is developed test-first. Final verification includes frontend tests, lint, production build, Python tests with a workspace-local temp directory, and diff checks.

