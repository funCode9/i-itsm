@echo off
title Stopping I-ITSM Servers...

echo Stopping I-ITSM Backend (port 8080) and Frontend (port 5173)...

:: Kill process listening on 8080 (backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    taskkill /f /pid %%a 2>nul
)

:: Kill process listening on 5173 (frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /f /pid %%a 2>nul
)

echo Both servers have been stopped.
timeout /t 2 >nul
exit
