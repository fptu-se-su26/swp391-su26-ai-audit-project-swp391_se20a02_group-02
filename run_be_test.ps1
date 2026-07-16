$fso = New-Object -ComObject Scripting.FileSystemObject
$shortRoot = $fso.GetFolder($PSScriptRoot).ShortPath
$shortJar  = "$shortRoot\src\Back_end\build\libs\Back_end-1.0.0.jar"

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
$port = if ($env:PORT) { $env:PORT } else { '8080' }

$javaCmd = "java -jar `"$shortJar`" --spring.profiles.active=sqlserver"

Write-Host "Executing command:" -ForegroundColor Cyan
Write-Host $javaCmd -ForegroundColor Yellow

# Kill old java processes to avoid port conflicts
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

Invoke-Expression $javaCmd
