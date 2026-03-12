@echo off
title UroSense - Stopping App

echo.
echo  =============================
echo   UROSENSE - Stopping App...
echo  =============================
echo.

echo Closing backend (port 3001)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /PID %%a /F >nul 2>&1

echo Closing frontend (port 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /PID %%a /F >nul 2>&1

echo Closing frontend (port 5174)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5174" ^| find "LISTENING"') do taskkill /PID %%a /F >nul 2>&1

echo Closing UroSense terminal windows...
taskkill /FI "WINDOWTITLE eq UroSense Backend" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq UroSense Frontend" /F >nul 2>&1

echo.
echo  =============================
echo   App stopped successfully!
echo  =============================
echo.
timeout /t 2 /nobreak >nul