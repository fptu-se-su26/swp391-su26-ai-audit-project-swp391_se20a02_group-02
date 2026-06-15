$fso = New-Object -ComObject Scripting.FileSystemObject
$shortRoot = $fso.GetFolder($PSScriptRoot).ShortPath
$shortJar  = "$shortRoot\src\Back_end\build\libs\Back_end-1.0.0.jar"

$javaCmd = "java " +
  "`"-DDB_HOST=localhost`" " +
  "`"-DDB_PORT=1433`" " +
  "`"-DDB_NAME=car_rental_platform`" " +
  "`"-DDB_USERNAME=sa`" " +
  "`"-DDB_PASSWORD=123456`" " +
  "`"-Dspring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=car_rental_platform;encrypt=false;trustServerCertificate=true`" " +
  "`"-Dspring.datasource.username=sa`" " +
  "`"-Dspring.datasource.password=123456`" " +
  "`"-DJWT_SECRET=LuxeWaySecretKey2024VeryLongAndSecureJWTTokenKeyForDevelopment256Bit`" " +
  "`"-DJWT_EXPIRATION=86400000`" " +
  "`"-DJWT_REFRESH_EXPIRATION=604800000`" " +
  "`"-DMAIL_USERNAME=dev@luxeway.vn`" " +
  "`"-DMAIL_PASSWORD=dev_mail_password`" " +
  "`"-DGOOGLE_CLIENT_ID=dev-google-client-id.apps.googleusercontent.com`" " +
  "`"-DGOOGLE_CLIENT_SECRET=dev-google-client-secret`" " +
  "`"-DVNPAY_TMN_CODE=LUXEWAY01`" " +
  "`"-DVNPAY_SECRET_KEY=LUXEWAY_VNPAY_SECRET_KEY_2024`" " +
  "`"-DVNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`" " +
  "`"-DVNPAY_ALLOWED_IPS=203.171.19.146`" " +
  "`"-DSTRIPE_PUBLIC_KEY=pk_test_placeholder`" " +
  "`"-DSTRIPE_SECRET_KEY=sk_test_placeholder`" " +
  "`"-DFRONTEND_URL=http://localhost:5173`" " +
  "`"-DLOG_LEVEL=INFO`" " +
  "-jar `"$shortJar`" --spring.profiles.active=sqlserver"

Write-Host "Executing command:" -ForegroundColor Cyan
Write-Host $javaCmd -ForegroundColor Yellow

# Kill old java processes to avoid port conflicts
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

Invoke-Expression $javaCmd
