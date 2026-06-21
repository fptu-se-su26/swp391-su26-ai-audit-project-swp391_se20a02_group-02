@echo off
echo ============================================================
echo LUXEWAY BACKEND STARTUP SCRIPT
echo ============================================================
echo.

echo [1/3] Checking Java version...
java -version
if %errorlevel% neq 0 (
    echo ERROR: Java not found! Please install Java 17 or higher.
    pause
    exit /b 1
)
echo.

echo [2/3] Checking Maven...
mvn -version
if %errorlevel% neq 0 (
    echo ERROR: Maven not found! Please install Maven.
    pause
    exit /b 1
)
echo.

echo [3/3] Starting LuxeWay Backend...
echo Database: SQL Server (localhost:1433)
echo Database Name: car_rental_platform
echo Port: 8080
echo Context Path: /api/v1
echo.

echo Starting Spring Boot application...
mvn spring-boot:run

pause