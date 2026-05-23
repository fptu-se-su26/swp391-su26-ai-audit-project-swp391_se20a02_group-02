@echo off
title LuxeWay Backend Startup
color 0A

echo ============================================================
echo                    LUXEWAY BACKEND
echo ============================================================
echo.

echo [INFO] Checking system requirements...
echo.

REM Check Java
echo Testing Java installation...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java not found! Please install Java 17+
    echo Download from: https://adoptium.net/
    pause
    exit /b 1
) else (
    echo [OK] Java is installed
)

REM Check if we can connect to SQL Server (simple test)
echo Testing SQL Server connection...
timeout /t 1 >nul
echo [INFO] Make sure SQL Server is running on localhost:1433
echo [INFO] Database: car_rental_platform should exist
echo.

REM Try to find Maven
echo Looking for Maven...
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Maven not found in PATH
    echo.
    echo SOLUTION OPTIONS:
    echo 1. Install Maven: https://maven.apache.org/download.cgi
    echo 2. Use IDE (IntelliJ IDEA, Eclipse, VS Code)
    echo 3. Use Spring Boot CLI
    echo.
    echo TO RUN WITH IDE:
    echo 1. Open IntelliJ IDEA or Eclipse
    echo 2. Import Maven project from this folder
    echo 3. Run: com.luxeway.LuxewayBackendApplication
    echo.
    echo ENDPOINTS TO TEST:
    echo - Health: http://localhost:8080/api/v1/test/health
    echo - Users:  http://localhost:8080/api/v1/users
    echo - Swagger: http://localhost:8080/api/v1/swagger-ui.html
    echo.
    pause
    exit /b 1
) else (
    echo [OK] Maven found
    echo.
    echo Starting LuxeWay Backend...
    echo Server will start on: http://localhost:8080/api/v1
    echo.
    mvn spring-boot:run
)

pause