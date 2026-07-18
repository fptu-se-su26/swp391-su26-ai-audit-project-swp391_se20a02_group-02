$connectionString = "Server=localhost,1433;Database=car_rental_platform;User Id=sa;Password=123456;Encrypt=False;TrustServerCertificate=True;"
try {
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    $cmd = $connection.CreateCommand()
    $cmd.CommandText = "UPDATE users SET verified = 1, kyc_verified = 1, driving_license_verified = 1, kyc_status = 'VERIFIED', driver_license_status = 'VERIFIED'"
    $rowsAffected = $cmd.ExecuteNonQuery()
    Write-Host "Successfully updated $rowsAffected user accounts to fully VERIFIED KYC status!" -ForegroundColor Green
    $connection.Close()
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
