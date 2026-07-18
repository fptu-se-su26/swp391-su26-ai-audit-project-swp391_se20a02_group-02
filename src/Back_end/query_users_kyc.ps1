$connectionString = "Server=localhost,1433;Database=car_rental_platform;User Id=sa;Password=123456;Encrypt=False;TrustServerCertificate=True;"
try {
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    $cmd = $connection.CreateCommand()
    $cmd.CommandText = "SELECT id, email, role, verified, kyc_status, driver_license_status, display_name FROM users"
    $reader = $cmd.ExecuteReader()
    Write-Host "ID | Email | Role | Verified | KYC Status | License Status | Display Name" -ForegroundColor Yellow
    while ($reader.Read()) {
        Write-Host ($reader.GetValue(0).ToString() + " | " + $reader.GetValue(1) + " | " + $reader.GetValue(2) + " | " + $reader.GetValue(3) + " | " + $reader.GetValue(4) + " | " + $reader.GetValue(5) + " | " + $reader.GetValue(6))
    }
    $reader.Close()
    $connection.Close()
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
