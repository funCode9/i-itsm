@echo off
title Starting I-ITSM Platform...

echo ========================================================
echo               STARTING I-ITSM PLATFORM
echo ========================================================
echo.

:: 1. Start Spring Boot Backend in a dedicated window
echo [1/3] Starting Spring Boot Backend (Port 8080)...
start "I-ITSM Backend (Port 8080)" cmd /k "cd /d C:\dev\i-itsm\backend && set DB_PASSWORD=Bit$7187S && .\mvnw.cmd spring-boot:run"

:: 2. Start Vite Frontend in a dedicated window
echo [2/3] Starting Vite Frontend (Port 5173)...
start "I-ITSM Frontend (Port 5173)" cmd /k "cd /d C:\dev\i-itsm\frontend && npm run dev -- --host 0.0.0.0"

:: 3. Wait a few seconds for initialization and launch browser
echo [3/3] Opening I-ITSM Console in default browser...
timeout /t 5 /nobreak >nul
start http://localhost:5173/

echo.
echo ========================================================
echo  Both servers are now running in their own windows!
echo  Keep the windows open to keep the servers alive.
echo  To stop them, simply close their command windows.
echo ========================================================
exit
