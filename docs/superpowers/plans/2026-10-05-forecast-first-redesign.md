# Forecast-First WorkWise PH Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver an editorial landing page, a decision-oriented Outlook Builder, creator attribution, and complete removal of the web admin surface.

**Architecture:** Keep the existing forecast APIs stable and derive the outlook through a pure TypeScript module. Let `AppShell` render the landing page without dashboard chrome while existing analysis routes retain it. Remove admin runtime code and data tables through a forward migration while keeping scheduled data refreshes.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Vitest, FastAPI, SQLAlchemy, Alembic, pytest.

**Spec:** `docs/superpowers/specs/2026-10-05-forecast-first-redesign.md`

## Global Constraints

- Preserve existing public API responses and analysis URLs.
- Use only the four currently forecasted headline rates and existing 3/6-month forecast data.
- Do not add accounts, AI prose, alerts, causal scenarios, or new datasets.
- Credit Jezreel Ramos concisely without turning the product landing page into a full portfolio.
- Keep scheduled Render and CLI refresh paths operational.

## Review Focus

- Invalid, missing, or out-of-range query values must resolve to supported defaults.
- Threshold equality must classify as overlap, never above or below.
- Missing forecast/history/anomaly values must produce honest empty states without throwing.
- `/` must omit dashboard chrome while every analysis page keeps usable desktop/mobile navigation.
- Removed admin URLs must be absent from navigation and return 404 from both frontend and API.

---

### Task 1: Outlook derivation contract

**Files:**
- Create: `frontend/lib/outlook.ts`
- Create: `frontend/tests/outlook.test.ts`

**Interfaces:**
- Produces: `deriveOutlook(data, horizon, threshold, anomalies)` and URL-value normalization helpers used by the forecasting page.

- [ ] Write tests for direction, stable tolerance, 3/6-month target selection, threshold above/below/equality overlap, recent anomaly summary, and invalid value normalization.
- [ ] Run the focused test and confirm it fails because the module is missing.
- [ ] Implement the minimal pure TypeScript derivation and normalization helpers.
- [ ] Run the focused test and full frontend suite.

### Task 2: Public landing page and Outlook Builder

**Files:**
- Modify: `frontend/components/AppShell.tsx`
- Modify: `frontend/app/page.tsx`
- Modify: `frontend/app/forecasting/page.tsx`
- Modify: `frontend/components/Sidebar.tsx`
- Modify: `frontend/lib/commands.ts`
- Test: `frontend/tests/AppShell.test.tsx`, `frontend/tests/commands.test.ts`

**Interfaces:**
- Consumes: Task 1 outlook helpers.
- Produces: route-aware shell, editorial landing page, creator section, and URL-driven Outlook Builder.

- [ ] Write failing shell/navigation tests that distinguish the landing route and remove admin discovery.
- [ ] Implement route-aware shell behavior and forecast-first navigation labels.
- [ ] Build the editorial landing page with live KPIs/forecast preview, product trust copy, supporting-analysis links, and Jezreel Ramos creator attribution plus GitHub/email links.
- [ ] Rework `/forecasting` around indicator, horizon, and validated threshold controls; render the derived brief, chart, anomalies, and collapsible method/validation details; add print action/styles.
- [ ] Run focused tests, full frontend tests, lint, and production build.

### Task 3: Remove admin runtime and database tables

**Files:**
- Modify: `backend/app/main.py`, `backend/app/core/config.py`, `backend/app/db/models.py`, `backend/pyproject.toml`
- Delete: admin frontend, router/service/auth/security modules and their dedicated tests.
- Create: `backend/alembic/versions/0004_remove_admin_surface.py`
- Test: `tests/api/test_admin_removed.py`

**Interfaces:**
- Removes: `/admin` and `/api/admin/*`; preserves all public GET APIs and scheduled refresh commands.

- [ ] Write failing API tests asserting representative former admin endpoints return 404.
- [ ] Unregister and remove admin/auth/upload runtime code, config, packages, models, navigation remnants, and POST CORS allowance.
- [ ] Add an Alembic upgrade dropping the two admin tables and a downgrade recreating their original definitions; leave legacy schemas intact.
- [ ] Run focused API tests and the Python suite with `--basetemp .tmp/pytest`.

### Task 4: Deployment and product documentation

**Files:**
- Modify: `README.md`, `PRODUCT.md`, `docs/DEPLOYMENT.md`, `docs/DATA_SOURCES.md`, `backend/.env.example`, `render.yaml`, frontend SEO files.

**Interfaces:**
- Documents: forecast-first product positioning, creator credit, public API surface, and cron/CLI-only operations.

- [ ] Remove admin credentials/endpoints/instructions and update the product summary, landing metadata, sitemap, robots rules, and data-refresh guidance.
- [ ] Verify scheduled refresh configuration remains unchanged except for removed admin secrets.
- [ ] Run the complete frontend and Python verification commands, `git diff --check`, and inspect the final diff against the spec.
