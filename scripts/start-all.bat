@echo off
title LuxeWay - Start All Services
color 0B

echo ============================================================
echo              LUXEWAY - START ALL SERVICES
echo ============================================================
echo.

echo [INFO] Starting LuxeWay Platform...
echo.

REM Check if we're in the right directory
if not exist "src\Front_end" (
    echo [ERROR] Please run this script from the project root directory
    pause
    exit /b 1
)

echo [1/3] Starting Frontend (React + Vite)...
echo.
start "LuxeWay Frontend" cmd /k "cd src\Front_end && npm run dev"
timeout /t 2 >nul

echo [2/3] Backend Instructions...
echo.
echo Backend needs to be started manually:
echo.
echo OPTION 1 - Using IDE (RECOMMENDED):
echo   1. Open IntelliJ IDEA or Eclipse
echo   2. Import Maven project from: src\Back_end
echo   3. Run: LuxewayBackendApplication.java
echo.
echo OPTION 2 - Using Maven (if installed):
echo   1. Open new terminal
echo   2. cd src\Back_end
echo   3. mvn spring-boot:run
echo.

echo [3/3] Opening Browser...
timeout /t 5 >nul
start http://localhost:5173/
start http://localhost:5173/test-backend

echo.
echo ============================================================
echo                    SERVICES STARTED
echo ============================================================
echo.
echo Frontend:     http://localhost:5173/
echo Backend Test: http://localhost:5173/test-backend
echo.
echo Backend API (when started):
echo   Health:     http://localhost:8080/api/v1/test/health
echo   Swagger:    http://localhost:8080/api/v1/swagger-ui.html
echo.
echo Press any key to view full instructions...
pause >nul

type START-PROJECT.md

pause