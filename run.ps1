# ============================================
# LuxeWay - Run Full Stack (BE + FE)
# Usage: powershell -ExecutionPolicy Bypass -File run.ps1
# ============================================

Write-Host ""
Write-Host "  LuxeWay Full Stack Launcher" -ForegroundColor Cyan
Write-Host "  ===========================" -ForegroundColor Cyan
Write-Host ""

# Use 8.3 short path to avoid Unicode issue with "Tai lieu"
$fso = New-Object -ComObject Scripting.FileSystemObject
$shortRoot = $fso.GetFolder($PSScriptRoot).ShortPath
$shortJar  = "$shortRoot\src\Back_end\build\libs\Back_end-1.0.0.jar"
$frontendPath = "$PSScriptRoot\src\Front_end"

# Check JAR
if (-not (Test-Path $shortJar)) {
    Write-Host "  [ERROR] Backend JAR not found. Run Gradle build first:" -ForegroundColor Red
    Write-Host "          cd src\Back_end && gradlew.bat bootJar -x test" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"; exit 1
}
Write-Host "  [OK] Backend JAR found" -ForegroundColor Green

# Check npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "  [ERROR] npm not found. Install Node.js: https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"; exit 1
}
Write-Host "  [OK] Node.js found" -ForegroundColor Green

# Build java command with all required env vars
$javaCmd = "java " +
  "-DDB_HOST=localhost " +
  "-DDB_PORT=1433 " +
  "-DDB_NAME=car_rental_platform " +
  "-DDB_USERNAME=sa " +
  "-DDB_PASSWORD=123456 " +
  "-Dspring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=car_rental_platform;encrypt=false;trustServerCertificate=true " +
  "-Dspring.datasource.username=sa " +
  "-Dspring.datasource.password=123456 " +
  "-DJWT_SECRET=LuxeWaySecretKey2024VeryLongAndSecureJWTTokenKeyForDevelopment256Bit " +
  "-DJWT_EXPIRATION=86400000 " +
  "-DJWT_REFRESH_EXPIRATION=604800000 " +
  "-DMAIL_USERNAME=dev@luxeway.vn " +
  "-DMAIL_PASSWORD=dev_mail_password " +
  "-DGOOGLE_CLIENT_ID=dev-google-client-id.apps.googleusercontent.com " +
  "-DGOOGLE_CLIENT_SECRET=dev-google-client-secret " +
  "-DVNPAY_TMN_CODE=LUXEWAY01 " +
  "-DVNPAY_SECRET_KEY=LUXEWAY_VNPAY_SECRET_KEY_2024 " +
  "-DVNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html " +
  "-DVNPAY_ALLOWED_IPS=203.171.19.146 " +
  "-DSTRIPE_PUBLIC_KEY=pk_test_placeholder " +
  "-DSTRIPE_SECRET_KEY=sk_test_placeholder " +
  "-DFRONTEND_URL=http://localhost:5173 " +
  "-DLOG_LEVEL=INFO " +
  "-jar `"$shortJar`" --spring.profiles.active=sqlserver"

# Kill old java
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

# Start Backend
Write-Host "  [1/2] Starting Backend (Spring Boot)..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/k", $javaCmd -WindowStyle Normal

# Start Frontend
Write-Host "  [2/2] Starting Frontend (Vite + React)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm run dev" -WindowStyle Normal

# Wait and open browser
Write-Host ""
Write-Host "  Waiting 10s for Backend to boot..." -ForegroundColor Gray
Start-Sleep -Seconds 10

Start-Process "http://localhost:5173/"
Start-Process "http://localhost:8080/api/v1/swagger-ui.html"

Write-Host ""
Write-Host "  ==============================" -ForegroundColor Green
Write-Host "  Frontend  > http://localhost:5173" -ForegroundColor White
Write-Host "  Backend   > http://localhost:8080/api/v1" -ForegroundColor White
Write-Host "  Swagger   > http://localhost:8080/api/v1/swagger-ui.html" -ForegroundColor White
Write-Host "  DB        > car_rental_platform @ localhost:1433" -ForegroundColor White
Write-Host "  ==============================" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to close"
