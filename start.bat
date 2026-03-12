@echo off
title UroSense - IoT Urine Monitor

echo.
echo  =============================
echo   UROSENSE - Starting App...
echo  =============================
echo.

echo [1/4] Installing backend dependencies...
cd /d %~dp0backend
call npm install --silent
cd /d %~dp0

echo [2/4] Installing frontend dependencies...
cd /d %~dp0frontend
call npm install --silent
cd /d %~dp0

echo [3/4] Starting backend...
start "UroSense Backend" cmd /k "cd /d %~dp0backend && node src/index.js"

echo Waiting for backend to boot...
timeout /t 3 /nobreak >nul

echo [4/4] Starting frontend...
start "UroSense Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Waiting for frontend to boot...
timeout /t 6 /nobreak >nul

echo.
echo Opening browser...
start http://localhost:5173

echo.
echo  App is running at http://localhost:5173
echo  Close the Backend and Frontend windows to stop the app.
echo.