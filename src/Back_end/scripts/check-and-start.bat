@echo off
echo ========================================
echo LUXEWAY BACKEND - CHECK AND START
echo ========================================
echo.

REM Check Java
echo [1/5] Checking Java...
java -version 2>&1 | findstr /i "version" >nul
if errorlevel 1 (
    echo [ERROR] Java not found! Please install Java 17+
    pause
    exit /b 1
)
echo [OK] Java found
echo.

REM Check if backend is already running
echo [2/5] Checking if backend is running...
netstat -ano | findstr ":8080" >nul
if not errorlevel 1 (
    echo [WARNING] Port 8080 is already in use!
    echo Do you want to kill the process? (Y/N)
    set /p choice=
    if /i "%choice%"=="Y" (
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080"') do (
            echo Killing process %%a...
            taskkill /F /PID %%a >nul 2>&1
        )
        echo [OK] Process killed
        timeout /t 2 >nul
    )
)
echo [OK] Port 8080 is available
echo.

REM Check SQL Server
echo [3/5] Checking SQL Server connection...
sqlcmd -S localhost -U sa -P 123456 -Q "SELECT 1" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Cannot connect to SQL Server!
    echo Please check:
    echo   - SQL Server is running
    echo   - Username: sa
    echo   - Password: 123456
    echo   - Port: 1433
    pause
    exit /b 1
)
echo [OK] SQL Server connected
echo.

REM Check database
echo [4/5] Checking database...
sqlcmd -S localhost -U sa -P 123456 -d car_rental_platform -Q "SELECT COUNT(*) FROM users" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Database 'car_rental_platform' not found or empty!
    echo Please run the schema.sql and import-data.sql first
    echo.
    echo Do you want to continue anyway? (Y/N)
    set /p choice=
    if /i not "%choice%"=="Y" (
        pause
        exit /b 1
    )
)
echo [OK] Database ready
echo.

REM Start backend
echo [5/5] Starting backend...
echo.
echo ========================================
echo BACKEND STARTING...
echo ========================================
echo.
echo Backend will start on: http://localhost:8080/api/v1
echo Swagger UI: http://localhost:8080/api/v1/swagger-ui.html
echo.
echo Press Ctrl+C to stop the backend
echo.

REM Use Gradle if available, otherwise use Maven
if exist "gradlew.bat" (
    echo Using Gradle...
    gradlew.bat bootRun
) else if exist "mvnw.cmd" (
    echo Using Maven wrapper...
    mvnw.cmd spring-boot:run
) else (
    echo Using Maven...
    mvn spring-boot:run
)

pause
