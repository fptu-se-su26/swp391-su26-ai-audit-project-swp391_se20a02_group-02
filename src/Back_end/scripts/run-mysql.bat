@echo off
echo ============================================================
echo LUXEWAY BACKEND - MYSQL PROFILE
echo ============================================================
echo.
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
pause
