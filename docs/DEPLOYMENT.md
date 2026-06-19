# Deployment Runbook — WorkWise PH V1

Three managed services: **NeonDB** (Postgres), **Render** (FastAPI API), **Vercel**
(Next.js dashboard). Steps you must do in each dashboard are marked 👤.

## 1. NeonDB (database)

1. 👤 You already have a Neon project. Copy the **pooled** connection string
   (Neon Console → Connect → enable "Connection pooling"). It looks like
   `postgresql://USER:PASSWORD@HOST-pooler.../DB?sslmode=require`.
2. From your machine, point `backend/.env`'s `DATABASE_URL` at it, then run the
   schema migration and the ETL once to populate the cloud database:
   ```bash
   cd backend && alembic upgrade head && cd ..
   python -m data_pipeline.scripts.run_etl
   ```
   (Re-run the ETL whenever PSA publishes new data.)

> Security: rotate the database password if it was ever shared in plaintext. The
> connection string belongs only in `backend/.env` (gitignored) and the Render
> dashboard — never in the frontend or git.

## 2. Render (backend API)

1. 👤 Render dashboard → **New → Blueprint**, select this repo. Render reads
   [`render.yaml`](../render.yaml) and provisions the `workwise-api` web service.
2. 👤 Set the env vars marked `sync: false`:
   - `DATABASE_URL` = the Neon **pooled** string.
   - `CORS_ORIGINS` = your Vercel URL (e.g. `https://workwiseph.vercel.app`). You can
     set this after step 3 and redeploy.
3. Deploy. Verify `https://<your-service>.onrender.com/api/health` returns
   `{"status":"ok"}` and `/api/kpis` returns data.

Build: `pip install -e backend` · Start: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`.

## 3. Vercel (frontend)

1. 👤 Vercel → **Add New → Project**, import this repo.
2. 👤 Set **Root Directory** to `frontend` (Vercel auto-detects Next.js there).
3. 👤 Add env var `NEXT_PUBLIC_API_URL` = your Render API base URL
   (e.g. `https://workwise-api.onrender.com`).
4. Deploy. Open the site; the dashboard fetches from the Render API in the browser.
5. 👤 Back in Render, set `CORS_ORIGINS` to the Vercel domain and redeploy so the
   browser is allowed to call the API.

## Checklist

- [ ] Neon pooled `DATABASE_URL` works locally; `alembic upgrade head` + ETL run against it
- [ ] Render service green; `/api/health` and `/api/kpis` return 200
- [ ] Vercel build succeeds with `NEXT_PUBLIC_API_URL` set
- [ ] `CORS_ORIGINS` on Render matches the Vercel domain
- [ ] Dashboard pages render charts with live data
