@echo off
echo ============================================================
echo LUXEWAY DATABASE CONNECTION TEST
echo ============================================================
echo.

echo Testing backend endpoints...
echo.

echo [1] Health Check:
curl -X GET "http://localhost:8080/api/v1/test/health" -H "accept: application/json"
echo.
echo.

echo [2] Database Info:
curl -X GET "http://localhost:8080/api/v1/test/db-info" -H "accept: application/json"
echo.
echo.

echo [3] Users Count:
curl -X GET "http://localhost:8080/api/v1/users?size=5" -H "accept: application/json"
echo.
echo.

echo [4] Vehicles Count:
curl -X GET "http://localhost:8080/api/v1/vehicles?size=5" -H "accept: application/json"
echo.
echo.

echo ============================================================
echo Test completed! Check the responses above.
echo If you see JSON responses, the backend is working correctly.
echo ============================================================
pause