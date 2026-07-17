$connectionString = "Server=localhost,1433;Database=car_rental_platform;User Id=sa;Password=123456;Encrypt=False;TrustServerCertificate=True;"
try {
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    $cmd = $connection.CreateCommand()
    
    Write-Host "--- Users KYC Status ---" -ForegroundColor Yellow
    $cmd.CommandText = "SELECT id, email, display_name, kyc_status, driver_license_status FROM users"
    $reader = $cmd.ExecuteReader()
    while ($reader.Read()) {
        Write-Host "ID=$($reader.GetValue(0)) Email=$($reader.GetValue(1)) Name=$($reader.GetValue(2)) KYC=$($reader.GetValue(3)) DL=$($reader.GetValue(4))"
    }
    $reader.Close()

    Write-Host "--- Table names check ---" -ForegroundColor Yellow
    $cmd.CommandText = "SELECT name FROM sys.tables"
    $reader = $cmd.ExecuteReader()
    $tables = @()
    while ($reader.Read()) {
        $tables += $reader.GetValue(0)
    }
    $reader.Close()
    Write-Host "Tables in database: $($tables -join ', ')"

    $connection.Close()
} catch {
    Write-Host "Failed: $_"
}
