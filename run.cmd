@echo off
rem Marvel Reading Tracker - start the local app.
rem Always launched on the same origin (http://127.0.0.1:8787) so browser storage,
rem and therefore your reading progress, stays in one place.

setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found on PATH.
  echo Install it from https://nodejs.org/ ^(the ARM64 build^) and run this again.
  pause
  exit /b 1
)

echo Starting Marvel Reading Tracker...
node server.mjs
if errorlevel 1 pause
endlocal
