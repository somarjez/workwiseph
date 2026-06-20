@echo off
REM Start WorkWise PH locally: backend (FastAPI) + frontend (Next.js).
cd /d "%~dp0"

echo Starting WorkWise PH...
echo.

start "WorkWise Backend" cmd /k "python -m uvicorn backend.app.main:app --reload --port 8000"
start "WorkWise Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Backend : http://localhost:8000/docs
echo Frontend: http://localhost:3000
echo Admin    : http://localhost:3000/admin  (admin / workwise-admin-2026)
echo.
echo Waiting for the frontend to come up, then opening the browser...
timeout /t 8 >nul
start "" http://localhost:3000

echo.
echo Two terminal windows are now running the servers.
echo Run stop.bat (or close those windows) to stop them.
