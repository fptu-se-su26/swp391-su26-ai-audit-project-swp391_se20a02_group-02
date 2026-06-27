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

# Load .env file variables into current process environment
$EnvFile = "$shortRoot\.env"
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith('#')) {
            $idx = $line.IndexOf('=')
            if ($idx -gt 0) {
                $k = $line.Substring(0, $idx).Trim()
                $v = $line.Substring($idx + 1).Trim()
                [System.Environment]::SetEnvironmentVariable($k, $v, 'Process')
            }
        }
    }
}

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

# Get variables from environment (loaded from .env) or fallback to defaults
$dbHost = if ($env:DB_HOST) { $env:DB_HOST } else { 'localhost' }
$dbPort = if ($env:DB_PORT) { $env:DB_PORT } else { '1433' }
$dbName = if ($env:DB_NAME) { $env:DB_NAME } else { 'car_rental_platform' }
$dbUser = if ($env:DB_USERNAME) { $env:DB_USERNAME } else { 'sa' }
$dbPass = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { '123456' }

$jwtSec = if ($env:JWT_SECRET) { $env:JWT_SECRET } else { 'LuxeWaySecretKey2024VeryLongAndSecureJWTTokenKeyForDevelopment256Bit' }
$jwtExp = if ($env:JWT_EXPIRATION) { $env:JWT_EXPIRATION } else { '86400000' }
$jwtRef = if ($env:JWT_REFRESH_EXPIRATION) { $env:JWT_REFRESH_EXPIRATION } else { '604800000' }

$mailUser = if ($env:MAIL_USERNAME) { $env:MAIL_USERNAME } else { 'dev@luxeway.vn' }
$mailPass = if ($env:MAIL_PASSWORD) { $env:MAIL_PASSWORD } else { 'dev_mail_password' }

$ggId = if ($env:GOOGLE_CLIENT_ID) { $env:GOOGLE_CLIENT_ID } else { 'dev-google-client-id.apps.googleusercontent.com' }
$ggSecret = if ($env:GOOGLE_CLIENT_SECRET) { $env:GOOGLE_CLIENT_SECRET } else { 'dev-google-client-secret' }

$vnpTmn = if ($env:VNPAY_TMN_CODE) { $env:VNPAY_TMN_CODE } else { 'LUXEWAY01' }
$vnpSec = if ($env:VNPAY_SECRET_KEY) { $env:VNPAY_SECRET_KEY } else { 'LUXEWAY_VNPAY_SECRET_KEY_2024' }
$vnpUrl = if ($env:VNPAY_URL) { $env:VNPAY_URL } else { 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html' }
$vnpIps = if ($env:VNPAY_ALLOWED_IPS) { $env:VNPAY_ALLOWED_IPS } else { '203.171.19.146' }

$stripePub = if ($env:STRIPE_PUBLIC_KEY) { $env:STRIPE_PUBLIC_KEY } else { 'pk_test_placeholder' }
$stripeSec = if ($env:STRIPE_SECRET_KEY) { $env:STRIPE_SECRET_KEY } else { 'sk_test_placeholder' }

$feUrl = if ($env:FRONTEND_URL) { $env:FRONTEND_URL } else { 'http://localhost:5173' }
$logLevel = if ($env:LOG_LEVEL) { $env:LOG_LEVEL } else { 'INFO' }
$goongKey = if ($env:GOONG_API_KEY) { $env:GOONG_API_KEY } else { 'mock_goong_key' }
$geminiKey = if ($env:GEMINI_API_KEY) { $env:GEMINI_API_KEY } else { 'mock_key' }
$fptaiKey = if ($env:FPTAI_API_KEY) { $env:FPTAI_API_KEY } else { 'BKfUiImFD4DI3RI2OEjoCahBTQOgVtPf' }
$port = if ($env:PORT) { $env:PORT } else { '8080' }

$javaCmd = "java " +
  "-DDB_HOST=`"$dbHost`" " +
  "-DDB_PORT=`"$dbPort`" " +
  "-DDB_NAME=`"$dbName`" " +
  "-DDB_USERNAME=`"$dbUser`" " +
  "-DDB_PASSWORD=`"$dbPass`" " +
  "`"-Dspring.datasource.url=jdbc:sqlserver://$dbHost`:$dbPort;databaseName=$dbName;encrypt=false;trustServerCertificate=true`" " +
  "-Dspring.datasource.username=`"$dbUser`" " +
  "-Dspring.datasource.password=`"$dbPass`" " +
  "-DJWT_SECRET=`"$jwtSec`" " +
  "-DJWT_EXPIRATION=`"$jwtExp`" " +
  "-DJWT_REFRESH_EXPIRATION=`"$jwtRef`" " +
  "-DMAIL_USERNAME=`"$mailUser`" " +
  "-DMAIL_PASSWORD=`"$mailPass`" " +
  "-DGOOGLE_CLIENT_ID=`"$ggId`" " +
  "-DGOOGLE_CLIENT_SECRET=`"$ggSecret`" " +
  "-DVNPAY_TMN_CODE=`"$vnpTmn`" " +
  "-DVNPAY_SECRET_KEY=`"$vnpSec`" " +
  "-DVNPAY_URL=`"$vnpUrl`" " +
  "-DVNPAY_ALLOWED_IPS=`"$vnpIps`" " +
  "-DSTRIPE_PUBLIC_KEY=`"$stripePub`" " +
  "-DSTRIPE_SECRET_KEY=`"$stripeSec`" " +
  "-DFRONTEND_URL=`"$feUrl`" " +
  "-DLOG_LEVEL=`"$logLevel`" " +
  "-DGOONG_API_KEY=`"$goongKey`" " +
  "-DGEMINI_API_KEY=`"$geminiKey`" " +
  "-Dfptai.api-key=`"$fptaiKey`" " +
  "-DPORT=`"$port`" " +
  "-jar `"$shortJar`" --spring.profiles.active=sqlserver"

# Clean up processes on ports 8080 (backend) and 5173 (frontend) to prevent locks and port conflicts
Write-Host "  Checking and clearing ports 8080 and 5173..." -ForegroundColor Gray
$ports = @(8080, 5173)
foreach ($p in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $procId = $conn.OwningProcess
            if ($procId) {
                $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
                if ($proc -and $proc.Name -ne "Idle") {
                    Write-Host "  Stopping process $($proc.Name) (PID: $procId) on port $p..." -ForegroundColor Yellow
                    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                }
            }
        }
    }
}

# Kill old java
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

# Clear existing Vite cache folder to prevent EPERM errors
$viteCache = "$frontendPath\node_modules\.vite"
if (Test-Path $viteCache) {
    Write-Host "  Clearing old Vite cache..." -ForegroundColor Gray
    Remove-Item -Recurse -Force $viteCache -ErrorAction SilentlyContinue
}


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
