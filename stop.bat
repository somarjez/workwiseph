@echo off
REM Stop the WorkWise PH local servers (backend on 8000, frontend on 3000).
echo Stopping WorkWise PH...

REM Kill whatever is listening on the dev ports (the actual servers).
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000,3000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

REM Close the terminal windows opened by start.bat (and their child processes).
taskkill /FI "WINDOWTITLE eq WorkWise Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq WorkWise Frontend*" /T /F >nul 2>&1

echo Stopped backend (port 8000) and frontend (port 3000).
