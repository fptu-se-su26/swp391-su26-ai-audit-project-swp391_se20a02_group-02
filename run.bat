@echo off
title LuxeWay - Run All Services
color 0B

echo ============================================================
echo              LUXEWAY - RUN ALL SERVICES
echo ============================================================
echo.

echo [INFO] Starting LuxeWay Platform (Frontend, Backend, ML Service, Agent Layer)...
echo.

REM Check if we're in the right directory
if not exist "src\Front_end" (
    echo [ERROR] Please run this script from the project root directory
    pause
    exit /b 1
)

echo [1/4] Starting Frontend (React + Vite)...
start "LuxeWay Frontend" cmd /k "cd src\Front_end && npm run dev"
timeout /t 2 >nul

echo [2/4] Starting Backend (Spring Boot)...
start "LuxeWay Backend" cmd /k "cd src\Back_end && mvn spring-boot:run"
timeout /t 2 >nul

echo [3/4] Starting ML Service (FastAPI)...
start "LuxeWay ML Service" cmd /k "call .venv\Scripts\activate && cd src\ml_service && uvicorn main:app --reload --port 8000"
timeout /t 2 >nul

echo [4/4] Starting Agent Layer (FastAPI)...
start "LuxeWay Agent Layer" cmd /k "call .venv\Scripts\activate && cd agent-layer && python main.py"
timeout /t 5 >nul

echo ============================================================
echo                    SERVICES STARTED
echo ============================================================
echo.
echo Frontend:     http://localhost:5173/
echo Backend:      http://localhost:8080/api/v1/test/health
echo ML Service:   http://localhost:8000/docs
echo Agent Layer:  http://localhost:8001/docs
echo.
echo Note: If the Python services fail to start, make sure you have created 
echo the virtual environment (.venv) and installed the requirements.
echo.
echo Press any key to exit this window...
pause >nul
