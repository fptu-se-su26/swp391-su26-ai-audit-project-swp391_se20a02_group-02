$connectionString = "Server=localhost,1433;Database=car_rental_platform;User Id=sa;Password=123456;Encrypt=False;TrustServerCertificate=True;"
try {
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    $cmd = $connection.CreateCommand()
    
    Write-Host "--- BOOKING INFO ---" -ForegroundColor Yellow
    $cmd.CommandText = "SELECT booking_code, base_price, service_fee, taxes, total, status FROM bookings WHERE booking_code = 'LXW-26-100017'"
    $reader = $cmd.ExecuteReader()
    while ($reader.Read()) {
        Write-Host ("Booking: " + $reader.GetValue(0) + " | base=" + $reader.GetValue(1) + " | fee=" + $reader.GetValue(2) + " | tax=" + $reader.GetValue(3) + " | total=" + $reader.GetValue(4) + " | status=" + $reader.GetValue(5))
    }
    $reader.Close()

    Write-Host "--- PAYMENTS ---" -ForegroundColor Yellow
    $cmd.CommandText = "SELECT booking_id, amount, status, method, transaction_id FROM payments"
    $reader = $cmd.ExecuteReader()
    while ($reader.Read()) {
        Write-Host ("Payment: booking=" + $reader.GetValue(0) + " | amount=" + $reader.GetValue(1) + " | status=" + $reader.GetValue(2) + " | method=" + $reader.GetValue(3) + " | txn=" + $reader.GetValue(4))
    }
    $reader.Close()

    $connection.Close()
} catch {
    Write-Host "Failed: $_"
}
