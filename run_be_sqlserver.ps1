# Get 8.3 short path of workspace
$fso = New-Object -ComObject Scripting.FileSystemObject
$shortRoot = $fso.GetFolder('.').ShortPath
$shortJar = "$shortRoot\src\Back_end\build\libs\Back_end-1.0.0.jar"

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

Write-Host "Starting LuxeWay Backend in SQL Server profile..." -ForegroundColor Green
Write-Host "Jar path: $shortJar" -ForegroundColor Cyan

# Execute java with quoted arguments to avoid PowerShell parsing issues
& java `
  "-DDB_HOST=localhost" `
  "-DDB_PORT=1433" `
  "-DDB_NAME=car_rental_platform" `
  "-DDB_USERNAME=sa" `
  "-DDB_PASSWORD=123456" `
  "-Dspring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=car_rental_platform;encrypt=false;trustServerCertificate=true" `
  "-Dspring.datasource.username=sa" `
  "-Dspring.datasource.password=123456" `
  "-DJWT_SECRET=LuxeWaySecretKey2024VeryLongAndSecureJWTTokenKeyForDevelopment256Bit" `
  "-DJWT_EXPIRATION=86400000" `
  "-DJWT_REFRESH_EXPIRATION=604800000" `
  "-DMAIL_USERNAME=dev@luxeway.vn" `
  "-DMAIL_PASSWORD=dev_mail_password" `
  "-Dspring.mail.host=smtp.gmail.com" `
  "-DGOOGLE_CLIENT_ID=dev-google-client-id.apps.googleusercontent.com" `
  "-DGOOGLE_CLIENT_SECRET=dev-google-client-secret" `
  "-DVNPAY_TMN_CODE=LUXEWAY01" `
  "-DVNPAY_SECRET_KEY=LUXEWAY_VNPAY_SECRET_KEY_2024" `
  "-DVNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html" `
  "-DVNPAY_ALLOWED_IPS=203.171.19.146" `
  "-DSTRIPE_PUBLIC_KEY=pk_test_placeholder" `
  "-DSTRIPE_SECRET_KEY=sk_test_placeholder" `
  "-DFRONTEND_URL=http://localhost:5173" `
  "-DLOG_LEVEL=INFO" `
  "-DGOONG_API_KEY=$env:GOONG_API_KEY" `
  "-jar" $shortJar `
  "--spring.profiles.active=sqlserver"
