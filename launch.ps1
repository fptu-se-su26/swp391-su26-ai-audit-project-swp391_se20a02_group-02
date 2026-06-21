# LuxeWay - Launch All Services
# Run with: powershell -ExecutionPolicy Bypass -File launch.ps1
#
# NOTE: Uses Windows 8.3 short paths to avoid Java crash caused by
#       Vietnamese Unicode characters in the folder name "Tai lieu".

# Get 8.3 short path of the script's own directory (avoids Unicode issue)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root      = (New-Object -ComObject Scripting.FileSystemObject).GetFolder($ScriptDir).ShortPath

$Backend  = "$Root\src\Back_end"
$Frontend = "$Root\src\Front_end"
$Jar      = "$Root\src\Back_end\target\LUXEWA~1.JAR"
$EnvFile  = "$Root\.env"

Write-Host ""
Write-Host "  LuxeWay | BE + FE + DB Launcher" -ForegroundColor Cyan
Write-Host "  ================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Java
$null = java -version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] Java not found. Install: https://adoptium.net/" -ForegroundColor Red
    Read-Host "Press Enter to exit"; exit 1
}
Write-Host "  [OK] Java found" -ForegroundColor Green

# 2. Check JAR
if (-not (Test-Path $Jar)) {
    Write-Host "  [ERROR] Backend JAR not found: $Jar" -ForegroundColor Red
    Write-Host "          Build from IntelliJ first (Run > Build Project)." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"; exit 1
}
Write-Host "  [OK] Backend JAR found" -ForegroundColor Green

# 3. Check npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "  [ERROR] npm not found. Install Node.js: https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"; exit 1
}
Write-Host "  [OK] Node.js / npm found" -ForegroundColor Green

# 4. Load .env
$envVars = @{}
if (Test-Path $EnvFile) {
    Write-Host "  [OK] Loading .env ..." -ForegroundColor Green
    Get-Content $EnvFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith('#')) {
            $idx = $line.IndexOf('=')
            if ($idx -gt 0) {
                $k = $line.Substring(0, $idx).Trim()
                $v = $line.Substring($idx + 1).Trim()
                $envVars[$k] = $v
                [System.Environment]::SetEnvironmentVariable($k, $v, 'Process')
            }
        }
    }
} else {
    Write-Host "  [WARN] .env not found" -ForegroundColor Yellow
}

# 5. Build -D args for JVM
$dArgs = ($envVars.Keys | ForEach-Object { "-D$_=`"$($envVars[$_])`"" }) -join ' '
$javaCmd = "java $dArgs -jar `"$Jar`" --spring.profiles.active=sqlserver"

$dbHost = if ($envVars['DB_HOST']) { $envVars['DB_HOST'] } else { 'localhost' }
$dbPort = if ($envVars['DB_PORT']) { $envVars['DB_PORT'] } else { '1433' }
$dbName = if ($envVars['DB_NAME']) { $envVars['DB_NAME'] } else { 'car_rental_platform' }

Write-Host ""
Write-Host "  DB: SQL Server @ $dbHost`:$dbPort  |  DB: $dbName" -ForegroundColor DarkCyan
Write-Host "  Make sure SQL Server is RUNNING!" -ForegroundColor Yellow
Write-Host ""

# 6. Start Backend in new window
Write-Host "  [1/2] Starting Backend (Spring Boot - sqlserver profile)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", $javaCmd -WindowStyle Normal

# 7. Start Frontend in new window
Write-Host "  [2/2] Starting Frontend (Vite + React)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Frontend'; npm run dev" -WindowStyle Normal

# 8. Wait and open browser
Write-Host ""
Write-Host "  Waiting 15s for Backend to boot..." -ForegroundColor Gray
Start-Sleep -Seconds 15

Start-Process "http://localhost:5173/"
Start-Process "http://localhost:8080/api/v1/swagger-ui.html"

Write-Host ""
Write-Host "  Services running in separate windows:" -ForegroundColor Green
Write-Host "  Frontend  >  http://localhost:5173" -ForegroundColor White
Write-Host "  Backend   >  http://localhost:8080/api/v1" -ForegroundColor White
Write-Host "  Swagger   >  http://localhost:8080/api/v1/swagger-ui.html" -ForegroundColor White
Write-Host "  DB        >  SQL Server @ $dbHost`:$dbPort ($dbName)" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to close this window"
