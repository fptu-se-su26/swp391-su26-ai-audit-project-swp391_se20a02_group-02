@echo off
echo ============================================================
echo LUXEWAY BACKEND - SQL SERVER PROFILE
echo ============================================================
echo.
mvn spring-boot:run -Dspring-boot.run.profiles=sqlserver
pause
