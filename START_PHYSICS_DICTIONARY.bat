@echo off
setlocal
cd /d "%~dp0"
title Physics in Motion - Animated Physics Dictionary
echo.
echo ============================================================
echo       PHYSICS IN MOTION - ANIMATED PHYSICS DICTIONARY
echo ============================================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js was not found.
  echo Install the current Node.js LTS version from https://nodejs.org/
  echo Then close this window and run this file again.
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm was not found. Reinstall Node.js with npm included.
  pause
  exit /b 1
)
if not exist "node_modules" (
  echo [1/2] Installing project dependencies. This runs only on first launch...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed. Check your internet connection.
    pause
    exit /b 1
  )
)
echo [2/2] Starting the local website...
start "" "http://127.0.0.1:5173"
call npm run dev
pause
