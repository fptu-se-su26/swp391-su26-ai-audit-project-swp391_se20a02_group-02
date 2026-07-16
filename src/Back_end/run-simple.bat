@echo off
echo ============================================================
echo LUXEWAY BACKEND - SIMPLE JAVA RUN
echo ============================================================
echo.

echo [INFO] Compiling Java files...
javac -cp "lib/*" -d build/classes src/main/java/com/luxeway/*.java src/main/java/com/luxeway/*/*.java
if %errorlevel% neq 0 (
    echo [ERROR] Compilation failed!
    pause
    exit /b 1
)

echo [INFO] Starting application...
java -cp "build/classes;lib/*" com.luxeway.LuxewayBackendApplication

pause