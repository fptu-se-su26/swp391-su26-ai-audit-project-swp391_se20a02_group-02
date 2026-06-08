@echo off
echo ============================================================
echo LUXEWAY BACKEND - H2 DATABASE PROFILE
echo ============================================================
echo.
mvn spring-boot:run -Dspring-boot.run.profiles=h2
pause
